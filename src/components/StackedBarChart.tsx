"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";

export interface BarSegment {
  id: string;
  label: string;
  sharePct: number; // 0 to 100
  formattedValue: string; // e.g. "৳18,184.93" or "72.8%"
  color: string; // Solid hex or CSS color
  pattern?: "solid" | "hatch";
  hatchColor?: string; // Border and stripe color for hatch pattern
  description?: string;
}

export interface BarRow {
  id: string;
  label: string; // Row name on the left (e.g. "Satkania", "Round 1", "Solo MFS")
  totalValueFormatted: string; // Metric on the right (e.g. "32.4", "100%", "27.21%")
  segments: BarSegment[];
}

export interface LegendItem {
  label: string;
  color: string;
  pattern?: "solid" | "hatch";
  hatchColor?: string;
}

export interface StackedBarChartProps {
  title?: string;
  subtitle?: string;
  legend?: LegendItem[];
  rows: BarRow[];
  labelWidth?: number; // Pixels for left label column, default 84
  compact?: boolean;
  className?: string;
}

export function StackedBarChart({
  title,
  subtitle,
  legend,
  rows,
  labelWidth = 84,
  compact = false,
  className = "",
}: StackedBarChartProps) {
  const [activeSegmentId, setActiveSegmentId] = useState<string | null>(null);
  const [activeRowId, setActiveRowId] = useState<string | null>(null);
  const [selectedSegmentId, setSelectedSegmentId] = useState<string | null>(null);
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{
    x: number;
    y: number;
    placement: "top" | "bottom";
  } | null>(null);
  const [hasAnimated, setHasAnimated] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);

  // Entrance Observer: triggers baseline unroll animation once when chart enters viewport
  useEffect(() => {
    if (typeof window === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setHasAnimated(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.08 }
    );
    if (chartRef.current) observer.observe(chartRef.current);
    return () => observer.disconnect();
  }, []);

  // Compute clamped tooltip coordinates relative to chart container
  const updateTooltipPosition = useCallback((targetEl: HTMLElement) => {
    if (!chartRef.current) return;
    const parentRect = chartRef.current.getBoundingClientRect();
    const segRect = targetEl.getBoundingClientRect();

    const rawX = segRect.left - parentRect.left + segRect.width / 2;
    // Clamp X between 90px and containerWidth - 90px to prevent tooltip overflow
    const clampedX = Math.max(90, Math.min(parentRect.width - 90, rawX));
    const spaceAbove = segRect.top - parentRect.top;

    // Flip gracefully below bar if insufficient headroom so it never occludes headers or legends
    if (spaceAbove < 72) {
      setTooltipPos({
        x: clampedX,
        y: segRect.bottom - parentRect.top + 8,
        placement: "bottom",
      });
    } else {
      setTooltipPos({
        x: clampedX,
        y: segRect.top - parentRect.top - 8,
        placement: "top",
      });
    }
  }, []);

  // Pointer hover handler
  const handlePointerEnter = (
    e: React.MouseEvent | React.FocusEvent,
    seg: BarSegment,
    row: BarRow
  ) => {
    // If a persistent touch/click selection is active on a different segment, ignore hover
    if (selectedSegmentId && selectedSegmentId !== seg.id) return;

    setActiveSegmentId(seg.id);
    setActiveRowId(row.id);
    updateTooltipPosition(e.currentTarget as HTMLElement);
  };

  const handlePointerLeave = () => {
    // If a selection is locked, keep it visible
    if (selectedSegmentId) return;
    setActiveSegmentId(null);
    setActiveRowId(null);
    setTooltipPos(null);
  };

  // Click & Touch tap selection toggle
  const handleSegmentClick = (
    e: React.MouseEvent | React.TouchEvent,
    seg: BarSegment,
    row: BarRow
  ) => {
    e.stopPropagation();
    if (selectedSegmentId === seg.id) {
      // Deselect
      setSelectedSegmentId(null);
      setSelectedRowId(null);
      setActiveSegmentId(null);
      setActiveRowId(null);
      setTooltipPos(null);
    } else {
      // Select
      setSelectedSegmentId(seg.id);
      setSelectedRowId(row.id);
      setActiveSegmentId(seg.id);
      setActiveRowId(row.id);
      updateTooltipPosition(e.currentTarget as HTMLElement);
    }
  };

  // Keyboard navigation
  const handleKeyDown = (
    e: React.KeyboardEvent,
    seg: BarSegment,
    row: BarRow
  ) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleSegmentClick(e as unknown as React.MouseEvent, seg, row);
    } else if (e.key === "Escape") {
      setSelectedSegmentId(null);
      setSelectedRowId(null);
      setActiveSegmentId(null);
      setActiveRowId(null);
      setTooltipPos(null);
    }
  };

  // Click outside listener to clear persistent selection
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      if (chartRef.current && !chartRef.current.contains(e.target as Node)) {
        setSelectedSegmentId(null);
        setSelectedRowId(null);
        setActiveSegmentId(null);
        setActiveRowId(null);
        setTooltipPos(null);
      }
    };
    document.addEventListener("click", handleDocumentClick);
    return () => document.removeEventListener("click", handleDocumentClick);
  }, []);

  const currentActiveRowId = selectedRowId || activeRowId;
  const currentActiveSegId = selectedSegmentId || activeSegmentId;

  const activeRow = rows.find((r) => r.id === currentActiveRowId);
  const activeSeg = activeRow?.segments.find((s) => s.id === currentActiveSegId);

  return (
    <div
      ref={chartRef}
      className={`kf-hz-chart ${compact ? "is-compact" : ""} ${className}`}
      onMouseLeave={handlePointerLeave}
    >
      {/* Header: Title & Subtitle on Left, Legend on Right */}
      {(title || subtitle || legend) && (
        <div className="kf-hz-header">
          <div className="kf-hz-title-group">
            {title && <h4 className="kf-hz-title">{title}</h4>}
            {subtitle && <span className="kf-hz-subtitle">{subtitle}</span>}
          </div>

          {legend && legend.length > 0 && (
            <div className="kf-hz-legend" role="group" aria-label="Chart legend">
              {legend.map((item, i) => (
                <div key={i} className="kf-hz-legend-item">
                  <span
                    className={`kf-hz-swatch ${item.pattern === "hatch" ? "is-hatch" : ""}`}
                    style={
                      item.pattern === "hatch"
                        ? ({
                            "--hatch-color": item.hatchColor || item.color,
                          } as React.CSSProperties)
                        : { backgroundColor: item.color }
                    }
                    aria-hidden="true"
                  />
                  <span className="kf-hz-legend-label">{item.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Rows Container */}
      <div className="kf-hz-rows" role="list">
        {rows.map((row, rowIdx) => {
          const isRowActive = !currentActiveRowId || currentActiveRowId === row.id;

          return (
            <div
              key={row.id}
              role="listitem"
              className={`kf-hz-row ${isRowActive ? "is-active-row" : "is-dimmed-row"}`}
            >
              {/* Row Label (Left, Right-aligned to baseline) */}
              <div
                className="kf-hz-row-label"
                style={{ width: `${labelWidth}px` }}
                title={row.label}
              >
                <span>{row.label}</span>
              </div>

              {/* Stacked Horizontal Bar Track with Baseline Growth Motion */}
              <div
                className="kf-hz-bar-track"
                role="img"
                aria-label={`${row.label}: ${row.totalValueFormatted}`}
              >
                <div
                  className={`kf-hz-bar-fill ${hasAnimated ? "is-animated" : ""}`}
                  style={{
                    animationDelay: `${rowIdx * 75}ms`,
                  }}
                >
                  {row.segments.map((seg, segIdx) => {
                    const isSegActive =
                      currentActiveSegId === seg.id && currentActiveRowId === row.id;
                    const isDimmed = currentActiveSegId !== null && !isSegActive;
                    const isHatch = seg.pattern === "hatch";
                    const isFirst = segIdx === 0;
                    const isLast = segIdx === row.segments.length - 1;

                    return (
                      <div
                        key={seg.id}
                        tabIndex={0}
                        role="button"
                        aria-label={`${seg.label}: ${seg.formattedValue} (${seg.sharePct}%)`}
                        aria-expanded={isSegActive}
                        onMouseEnter={(e) => handlePointerEnter(e, seg, row)}
                        onFocus={(e) => handlePointerEnter(e, seg, row)}
                        onBlur={handlePointerLeave}
                        onClick={(e) => handleSegmentClick(e, seg, row)}
                        onKeyDown={(e) => handleKeyDown(e, seg, row)}
                        className={`kf-hz-segment ${isHatch ? "is-hatch" : ""} ${
                          isSegActive ? "is-active" : ""
                        } ${isDimmed ? "is-dimmed" : ""}`}
                        style={{
                          width: `${Math.max(0.5, seg.sharePct)}%`,
                          backgroundColor: isHatch ? undefined : seg.color,
                          borderTopLeftRadius: isFirst ? "4px" : "0",
                          borderBottomLeftRadius: isFirst ? "4px" : "0",
                          borderTopRightRadius: isLast ? "4px" : "0",
                          borderBottomRightRadius: isLast ? "4px" : "0",
                          marginRight: isLast ? 0 : "-0.5px",
                          ...(isHatch
                            ? ({
                                "--hatch-color": seg.hatchColor || seg.color,
                              } as React.CSSProperties)
                            : {}),
                        }}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Total / Value on the Right */}
              <div className="kf-hz-row-val kf-tabular">
                <span>{row.totalValueFormatted}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Tooltip Detail on Hover/Focus/Touch Selection */}
      {activeSeg && activeRow && tooltipPos && (
        <div
          className={`kf-hz-tooltip is-${tooltipPos.placement}`}
          style={{
            left: `${tooltipPos.x}px`,
            top: `${tooltipPos.y}px`,
          }}
          role="tooltip"
          aria-live="polite"
        >
          <div className="kf-hz-tooltip-inner">
            <div className="kf-hz-tooltip-top">
              <span
                className={`kf-hz-tooltip-swatch ${
                  activeSeg.pattern === "hatch" ? "is-hatch" : ""
                }`}
                style={
                  activeSeg.pattern === "hatch"
                    ? ({
                        "--hatch-color": activeSeg.hatchColor || activeSeg.color,
                      } as React.CSSProperties)
                    : { backgroundColor: activeSeg.color }
                }
                aria-hidden="true"
              />
              <strong>{activeSeg.label}</strong>
            </div>
            <div className="kf-hz-tooltip-val kf-tabular">
              {activeSeg.formattedValue.includes("%")
                ? activeSeg.formattedValue
                : `${activeSeg.formattedValue} (${activeSeg.sharePct.toFixed(1)}%)`}
            </div>
            {activeSeg.description && (
              <p className="kf-hz-tooltip-desc">{activeSeg.description}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
