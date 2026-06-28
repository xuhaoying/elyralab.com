export type AnalyticsProperties = Record<
  string,
  string | number | boolean | null | undefined
>;

export type ToolAnalyticsEvent =
  | 'tool_start'
  | 'result_generated'
  | 'copy_result'
  | 'download_result'
  | 'related_tool_click';

declare global {
  interface Window {
    gtag?: (
      command: 'event',
      eventName: string,
      params?: Record<string, unknown>
    ) => void;
    plausible?: (
      eventName: string,
      options?: { props?: Record<string, unknown> }
    ) => void;
    clarity?: (command: 'event', eventName: string) => void;
    va?: (
      command: 'event',
      payload: { name: string; data?: Record<string, unknown> }
    ) => void;
  }
}

function cleanProperties(properties: AnalyticsProperties = {}) {
  return Object.fromEntries(
    Object.entries(properties).filter(([, value]) => value !== undefined)
  );
}

export function trackToolEvent(
  eventName: ToolAnalyticsEvent,
  properties?: AnalyticsProperties
) {
  if (typeof window === 'undefined') {
    return false;
  }

  const props = cleanProperties(properties);
  let tracked = false;

  try {
    window.gtag?.('event', eventName, props);
    tracked = tracked || Boolean(window.gtag);

    window.plausible?.(eventName, { props });
    tracked = tracked || Boolean(window.plausible);

    window.clarity?.('event', eventName);
    tracked = tracked || Boolean(window.clarity);

    window.va?.('event', { name: eventName, data: props });
    tracked = tracked || Boolean(window.va);
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('Analytics event failed', eventName, error);
    }
  }

  if (!tracked && process.env.NODE_ENV === 'development') {
    console.info('[analytics]', eventName, props);
  }

  return tracked;
}
