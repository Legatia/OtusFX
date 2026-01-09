"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, RefreshCw, Maximize2, Minimize2, Clock } from "lucide-react";
import { usePythPrices, formatPrice } from "@/lib/pyth";

interface PriceChartProps {
    pair: string;
    onPriceUpdate?: (price: number) => void;
}

// Time scales with their configurations (FX-appropriate intervals, 1-minute polling)
const TIME_SCALES = [
    { label: "30m", seconds: 1800, dataPoints: 30, intervalSec: 60 },   // 30 points at 1-min intervals
    { label: "1h", seconds: 3600, dataPoints: 60, intervalSec: 60 },    // 60 points at 1-min intervals
    { label: "1d", seconds: 86400, dataPoints: 96, intervalSec: 900 },  // 96 points at 15-min intervals
    { label: "7d", seconds: 604800, dataPoints: 168, intervalSec: 3600 }, // 168 points at 1-hour intervals
];

// Note: Pyth Benchmarks TradingView API doesn't support FX pairs
// We rely on real-time data collection for chart history

interface HistoricalDataPoint {
    price: number;
    time: Date;
}

export default function PriceChart({ pair, onPriceUpdate }: PriceChartProps) {
    const { prices, loading, error, refetch } = usePythPrices([pair]);
    const [priceHistory, setPriceHistory] = useState<HistoricalDataPoint[]>([]);
    const [selectedScale, setSelectedScale] = useState(1); // 1h default
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [crosshair, setCrosshair] = useState<{ x: number; y: number; price: number; time: Date } | null>(null);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);
    const [historyError, setHistoryError] = useState<string | null>(null);
    const [dataSource, setDataSource] = useState<'pyth' | 'local' | 'realtime'>('pyth');
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const lastFetchedScale = useRef<number | null>(null);
    const lastFetchedPair = useRef<string | null>(null);
    const isFetching = useRef(false);

    const priceData = prices[pair];
    const scale = TIME_SCALES[selectedScale];

    // Update parent with new price
    useEffect(() => {
        if (priceData && onPriceUpdate) {
            onPriceUpdate(priceData.price);
        }
    }, [priceData, onPriceUpdate]);

    // Fetch historical data from local SQLite API
    const fetchLocalHistory = useCallback(async (): Promise<HistoricalDataPoint[] | null> => {
        try {
            const now = Math.floor(Date.now() / 1000);
            const from = now - scale.seconds;

            const response = await fetch(
                `/api/prices/history?pair=${encodeURIComponent(pair)}&from=${from}&to=${now}&limit=500`
            );

            if (!response.ok) return null;

            const data = await response.json();

            if (data.prices && data.prices.length >= 2) {
                return data.prices.map((p: { price: number; timestamp: number }) => ({
                    price: p.price,
                    time: new Date(p.timestamp * 1000),
                }));
            }

            return null;
        } catch {
            return null;
        }
    }, [pair, scale.seconds]);

    // Fetch historical data - try local DB first, fall back to real-time collection
    const fetchHistoricalData = useCallback(async () => {
        // Prevent duplicate fetches
        if (isFetching.current) return;
        if (lastFetchedScale.current === selectedScale && lastFetchedPair.current === pair) return;

        isFetching.current = true;
        setIsLoadingHistory(true);
        setHistoryError(null);

        // Try local SQLite database first (if price collector has been running)
        const localData = await fetchLocalHistory();
        if (localData && localData.length >= 2) {
            setPriceHistory(localData);
            lastFetchedScale.current = selectedScale;
            lastFetchedPair.current = pair;
            setDataSource('local');
            setIsLoadingHistory(false);
            isFetching.current = false;
            return;
        }

        // Fall back to real-time collection (chart builds up over time)
        setHistoryError('Building chart from live data...');
        setPriceHistory([]);
        lastFetchedScale.current = selectedScale;
        lastFetchedPair.current = pair;
        setDataSource('realtime');
        setIsLoadingHistory(false);
        isFetching.current = false;
    }, [pair, selectedScale, fetchLocalHistory]);

    // Fetch historical data when scale or pair changes
    useEffect(() => {
        // Reset history when pair changes
        if (lastFetchedPair.current !== pair) {
            setPriceHistory([]);
            lastFetchedScale.current = null;
            lastFetchedPair.current = null;
        }
        fetchHistoricalData();
    }, [selectedScale, pair, fetchHistoricalData]);

    // Add real-time updates to history (throttled to match intervals)
    useEffect(() => {
        if (priceData && priceData.price > 0 && !isLoadingHistory) {
            // If no history yet, start with first data point
            if (priceHistory.length === 0) {
                setPriceHistory([{ price: priceData.price, time: new Date() }]);
                return;
            }

            const lastPoint = priceHistory[priceHistory.length - 1];
            const timeSinceLastPoint = Date.now() - lastPoint.time.getTime();

            // Add new point if at least 5 seconds have passed (faster updates for real-time feel)
            if (timeSinceLastPoint >= 5000) {
                setPriceHistory(prev => {
                    const updated = [...prev, { price: priceData.price, time: new Date() }];
                    return updated.slice(-scale.dataPoints);
                });
            }
        }
    }, [priceData, isLoadingHistory, priceHistory.length, scale.dataPoints]);

    // Format price for axis labels
    const formatAxisPrice = (price: number): string => {
        if (price >= 100) return price.toFixed(2);
        if (price >= 10) return price.toFixed(3);
        return price.toFixed(4);
    };

    // Draw chart
    const drawChart = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas || priceHistory.length < 2) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();

        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);

        const width = rect.width;
        const height = rect.height;

        // Chart area with space for axes
        const paddingLeft = 10;
        const paddingRight = 70;
        const paddingTop = 30;
        const paddingBottom = 45;

        const chartWidth = width - paddingLeft - paddingRight;
        const chartHeight = height - paddingTop - paddingBottom;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Calculate price range
        const prices = priceHistory.map(p => p.price);
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        const priceRange = maxPrice - minPrice || minPrice * 0.001;
        const pricePadding = priceRange * 0.1;
        const adjustedMin = minPrice - pricePadding;
        const adjustedMax = maxPrice + pricePadding;
        const adjustedRange = adjustedMax - adjustedMin;

        // Draw background gradient
        const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
        bgGradient.addColorStop(0, 'rgba(15, 23, 42, 0.8)');
        bgGradient.addColorStop(1, 'rgba(15, 23, 42, 0.4)');
        ctx.fillStyle = bgGradient;
        ctx.fillRect(0, 0, width, height);

        // Draw grid lines
        const numGridLines = 5;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.lineWidth = 1;

        // Horizontal grid lines with price labels
        ctx.font = '11px Inter, sans-serif';
        ctx.textAlign = 'left';
        for (let i = 0; i <= numGridLines; i++) {
            const y = paddingTop + (i / numGridLines) * chartHeight;
            const price = adjustedMax - (i / numGridLines) * adjustedRange;

            ctx.beginPath();
            ctx.moveTo(paddingLeft, y);
            ctx.lineTo(width - paddingRight, y);
            ctx.stroke();

            ctx.fillStyle = 'rgba(148, 163, 184, 0.8)';
            ctx.fillText(formatAxisPrice(price), width - paddingRight + 8, y + 4);
        }

        // Vertical grid lines with time labels
        const timeGridLines = 3;
        for (let i = 0; i <= timeGridLines; i++) {
            const x = paddingLeft + (i / timeGridLines) * chartWidth;

            ctx.beginPath();
            ctx.moveTo(x, paddingTop);
            ctx.lineTo(x, height - paddingBottom);
            ctx.stroke();

            if (priceHistory.length > 1) {
                const index = Math.floor((i / timeGridLines) * (priceHistory.length - 1));
                const time = priceHistory[index]?.time;
                if (time) {
                    ctx.textAlign = 'center';
                    ctx.fillStyle = 'rgba(148, 163, 184, 0.6)';

                    // Format time based on scale
                    let timeLabel: string;
                    if (scale.seconds <= 3600) {
                        // 30m, 1h: show hour:minute
                        timeLabel = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    } else if (scale.seconds <= 86400) {
                        // 1d: show day + hour
                        timeLabel = time.toLocaleDateString([], { weekday: 'short' }) + ' ' +
                                   time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    } else {
                        // 7d: show date
                        timeLabel = time.toLocaleDateString([], { month: 'short', day: 'numeric' });
                    }

                    ctx.fillText(timeLabel, x, height - paddingBottom + 14);
                }
            }
        }

        // Determine if positive trend
        const isPositive = priceHistory[priceHistory.length - 1].price >= priceHistory[0].price;
        const lineColor = isPositive ? '#10b981' : '#ef4444';
        const fillColorStart = isPositive ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)';
        const fillColorEnd = isPositive ? 'rgba(16, 185, 129, 0.02)' : 'rgba(239, 68, 68, 0.02)';

        // Calculate points
        const points = priceHistory.map((p, i) => ({
            x: paddingLeft + (i / (priceHistory.length - 1)) * chartWidth,
            y: paddingTop + chartHeight - ((p.price - adjustedMin) / adjustedRange) * chartHeight,
            price: p.price,
            time: p.time,
        }));

        // Draw area fill
        const areaGradient = ctx.createLinearGradient(0, paddingTop, 0, height - paddingBottom);
        areaGradient.addColorStop(0, fillColorStart);
        areaGradient.addColorStop(1, fillColorEnd);

        ctx.beginPath();
        ctx.moveTo(points[0].x, height - paddingBottom);
        points.forEach(p => ctx.lineTo(p.x, p.y));
        ctx.lineTo(points[points.length - 1].x, height - paddingBottom);
        ctx.closePath();
        ctx.fillStyle = areaGradient;
        ctx.fill();

        // Draw line with glow effect
        ctx.shadowColor = lineColor;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        points.forEach((p, i) => {
            if (i === 0) ctx.moveTo(p.x, p.y);
            else ctx.lineTo(p.x, p.y);
        });
        ctx.strokeStyle = lineColor;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Draw current price dot with pulse effect
        const lastPoint = points[points.length - 1];

        ctx.beginPath();
        ctx.arc(lastPoint.x, lastPoint.y, 12, 0, Math.PI * 2);
        ctx.fillStyle = isPositive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(lastPoint.x, lastPoint.y, 6, 0, Math.PI * 2);
        ctx.fillStyle = isPositive ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(lastPoint.x, lastPoint.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = lineColor;
        ctx.fill();

        // Draw current price line
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = lineColor;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(lastPoint.x, lastPoint.y);
        ctx.lineTo(width - paddingRight, lastPoint.y);
        ctx.stroke();
        ctx.setLineDash([]);

        // Draw current price badge
        const badgeHeight = 20;
        const badgeWidth = 60;
        ctx.fillStyle = lineColor;
        roundRect(ctx, width - paddingRight + 2, lastPoint.y - badgeHeight / 2, badgeWidth, badgeHeight, 4);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(formatAxisPrice(lastPoint.price), width - paddingRight + 2 + badgeWidth / 2, lastPoint.y + 4);

        // Draw crosshair if hovering
        if (crosshair) {
            ctx.setLineDash([4, 4]);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.lineWidth = 1;

            ctx.beginPath();
            ctx.moveTo(crosshair.x, paddingTop);
            ctx.lineTo(crosshair.x, height - paddingBottom);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(paddingLeft, crosshair.y);
            ctx.lineTo(width - paddingRight, crosshair.y);
            ctx.stroke();

            ctx.setLineDash([]);
        }

    }, [priceHistory, crosshair]);

    useEffect(() => {
        drawChart();
    }, [drawChart]);

    // Handle mouse move for crosshair
    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas || priceHistory.length < 2) return;

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const paddingLeft = 10;
        const paddingRight = 70;
        const paddingTop = 30;
        const paddingBottom = 45;
        const chartWidth = rect.width - paddingLeft - paddingRight;
        const chartHeight = rect.height - paddingTop - paddingBottom;

        const index = Math.round(((x - paddingLeft) / chartWidth) * (priceHistory.length - 1));
        const clampedIndex = Math.max(0, Math.min(priceHistory.length - 1, index));
        const dataPoint = priceHistory[clampedIndex];

        if (dataPoint && x >= paddingLeft && x <= rect.width - paddingRight && y >= paddingTop && y <= rect.height - paddingBottom) {
            const prices = priceHistory.map(p => p.price);
            const minPrice = Math.min(...prices);
            const maxPrice = Math.max(...prices);
            const priceRange = maxPrice - minPrice || minPrice * 0.001;
            const pricePadding = priceRange * 0.1;
            const adjustedMin = minPrice - pricePadding;
            const adjustedMax = maxPrice + pricePadding;
            const adjustedRange = adjustedMax - adjustedMin;

            const pointX = paddingLeft + (clampedIndex / (priceHistory.length - 1)) * chartWidth;
            const pointY = paddingTop + chartHeight - ((dataPoint.price - adjustedMin) / adjustedRange) * chartHeight;

            setCrosshair({ x: pointX, y: pointY, price: dataPoint.price, time: dataPoint.time });
        }
    };

    const handleMouseLeave = () => {
        setCrosshair(null);
    };

    // Handle scale change
    const handleScaleChange = (index: number) => {
        if (index !== selectedScale) {
            lastFetchedScale.current = null; // Force refetch
            isFetching.current = false; // Allow new fetch
            setSelectedScale(index);
        }
    };

    // Loading state
    if ((loading && !priceData) || isLoadingHistory) {
        return (
            <div className="h-full flex flex-col">
                <div className="p-4 border-b border-white/5">
                    <div className="text-sm text-secondary">{pair}</div>
                    <div className="text-2xl font-bold text-white">--</div>
                </div>
                <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-surface to-background">
                    <div className="text-center">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                            <Clock className="w-10 h-10 text-accent/50 mx-auto mb-3" />
                        </motion.div>
                        <p className="text-secondary text-sm mb-1">
                            {isLoadingHistory ? 'Loading historical data...' : 'Loading Pyth prices...'}
                        </p>
                        <p className="text-secondary/50 text-xs">
                            {isLoadingHistory ? `Fetching ${scale.label} data from Pyth Benchmarks` : 'Connecting to Pyth Network'}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (error && !priceData) {
        return (
            <div className="h-full flex items-center justify-center bg-gradient-to-br from-surface to-background">
                <div className="text-center">
                    <TrendingUp className="w-8 h-8 text-red-400/50 mx-auto mb-2" />
                    <p className="text-red-400 text-sm">Error: {error}</p>
                    <button onClick={refetch} className="mt-2 text-accent text-sm hover:underline">
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div ref={containerRef} className={`h-full flex flex-col ${isFullscreen ? 'fixed inset-0 z-50 bg-background' : ''}`}>
            {/* Chart Header */}
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div>
                        <div className="text-sm text-secondary">{pair}</div>
                        <div className="flex items-baseline gap-2">
                            <motion.span
                                key={priceData?.price}
                                initial={{ opacity: 0.5, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-2xl font-bold text-white"
                            >
                                {priceData ? formatPrice(priceData.price) : '--'}
                            </motion.span>
                            {priceData && (
                                <span className={`text-sm font-medium flex items-center gap-1 ${priceData.isMarketClosed ? 'text-yellow-400' : 'text-emerald-400'
                                    }`}>
                                    {priceData.isMarketClosed ? (
                                        'Market Closed'
                                    ) : (
                                        <>
                                            {priceHistory.length > 1 && priceHistory[priceHistory.length - 1]?.price >= priceHistory[0]?.price
                                                ? <TrendingUp className="w-4 h-4" />
                                                : <TrendingDown className="w-4 h-4" />
                                            }
                                            Live
                                        </>
                                    )}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Crosshair info */}
                    {crosshair && (
                        <div className="hidden sm:flex items-center gap-3 px-3 py-1.5 rounded-lg bg-white/5 text-sm">
                            <span className="text-secondary">
                                {crosshair.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </span>
                            <span className="text-white font-medium">{formatAxisPrice(crosshair.price)}</span>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    {/* Time Scale Selector */}
                    <div className="flex rounded-lg bg-white/5 p-0.5">
                        {TIME_SCALES.map((s, i) => (
                            <button
                                key={s.label}
                                onClick={() => handleScaleChange(i)}
                                disabled={isLoadingHistory}
                                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all disabled:opacity-50 ${selectedScale === i
                                    ? 'bg-accent text-white'
                                    : 'text-secondary hover:text-white'
                                    }`}
                            >
                                {s.label}
                            </button>
                        ))}
                    </div>

                    {/* High/Low */}
                    <div className="hidden sm:flex items-center gap-4 text-sm px-3">
                        <div>
                            <span className="text-secondary">H: </span>
                            <span className="text-white">{priceData ? formatPrice(priceData.high24h) : '--'}</span>
                        </div>
                        <div>
                            <span className="text-secondary">L: </span>
                            <span className="text-white">{priceData ? formatPrice(priceData.low24h) : '--'}</span>
                        </div>
                    </div>

                    {/* Fullscreen toggle */}
                    <button
                        onClick={() => setIsFullscreen(!isFullscreen)}
                        className="p-2 rounded-lg hover:bg-white/5 text-secondary hover:text-white transition-colors"
                    >
                        {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                    </button>
                </div>
            </div>

            {/* Chart Canvas */}
            <div className="flex-1 relative min-h-0">
                {priceHistory.length < 2 ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-surface to-background">
                        <div className="text-center max-w-xs">
                            <RefreshCw className="w-8 h-8 text-accent/50 mx-auto mb-3 animate-spin" />
                            <p className="text-white/80 text-sm font-medium mb-1">
                                {historyError || 'Loading chart data...'}
                            </p>
                            <p className="text-secondary/50 text-xs">
                                {priceHistory.length > 0
                                    ? `${priceHistory.length} data point${priceHistory.length > 1 ? 's' : ''} collected`
                                    : 'Waiting for price updates from Pyth'
                                }
                            </p>
                            {priceHistory.length === 0 && (
                                <p className="text-secondary/40 text-xs mt-2">
                                    Run <code className="bg-white/10 px-1 rounded">npm run collect-prices</code> to build history
                                </p>
                            )}
                        </div>
                    </div>
                ) : (
                    <canvas
                        ref={canvasRef}
                        className="w-full h-full cursor-crosshair"
                        style={{ display: 'block' }}
                        onMouseMove={handleMouseMove}
                        onMouseLeave={handleMouseLeave}
                    />
                )}

                {/* Pyth Branding */}
                <div className="absolute top-2 left-2 flex items-center gap-2 text-xs text-secondary/50">
                    <span>Powered by</span>
                    <span className="font-semibold text-purple-400">Pyth Network</span>
                </div>

                {/* Data info */}
                <div className="absolute top-2 right-2 text-xs text-secondary/50">
                    {priceHistory.length} points • {scale.label}
                </div>

                {/* History error notice */}
                {historyError && (
                    <div className="absolute bottom-12 left-2 text-xs text-yellow-400/70">
                        {historyError} - showing real-time data
                    </div>
                )}

                {/* Last Update */}
                {priceData && (
                    <div className="absolute bottom-12 right-2 text-xs text-secondary/50">
                        Updated: {priceData.lastUpdate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                )}
            </div>
        </div>
    );
}

// Helper function to draw rounded rectangles
function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
}
