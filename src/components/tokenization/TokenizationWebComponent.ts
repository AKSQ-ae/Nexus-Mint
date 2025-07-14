// Custom Web Component for external embedding
class TokenizationFlowElement extends HTMLElement {
  private iframe: HTMLIFrameElement | null = null;
  private resizeObserver: ResizeObserver | null = null;

  static get observedAttributes() {
    return ['property-id', 'compact', 'auto-refresh', 'theme', 'height'];
  }

  connectedCallback() {
    this.render();
    this.setupMessageListener();
    this.setupResizeObserver();
  }

  disconnectedCallback() {
    this.cleanup();
  }

  attributeChangedCallback() {
    if (this.iframe) {
      this.updateIframe();
    }
  }

  private render() {
    const propertyId = this.getAttribute('property-id') || '';
    const compact = this.getAttribute('compact') === 'true';
    const autoRefresh = this.getAttribute('auto-refresh') !== 'false';
    const theme = this.getAttribute('theme') || 'auto';
    const height = this.getAttribute('height') || (compact ? '200px' : '400px');

    // Build iframe URL with parameters
    const params = new URLSearchParams({
      propertyId,
      compact: compact.toString(),
      autoRefresh: autoRefresh.toString(),
      theme
    });

    // Replace with your actual domain
    const baseUrl = window.location.origin;
    const iframeSrc = `${baseUrl}/tokenization-widget?${params.toString()}`;

    this.innerHTML = `
      <div style="position: relative; width: 100%; height: ${height}; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        <iframe
          src="${iframeSrc}"
          style="width: 100%; height: 100%; border: none; background: transparent;"
          sandbox="allow-scripts allow-same-origin"
          loading="lazy"
          title="Tokenization Flow Widget"
        ></iframe>
      </div>
    `;

    this.iframe = this.querySelector('iframe');
  }

  private updateIframe() {
    if (!this.iframe) return;
    
    const propertyId = this.getAttribute('property-id') || '';
    const compact = this.getAttribute('compact') === 'true';
    const autoRefresh = this.getAttribute('auto-refresh') !== 'false';
    const theme = this.getAttribute('theme') || 'auto';

    const params = new URLSearchParams({
      propertyId,
      compact: compact.toString(),
      autoRefresh: autoRefresh.toString(),
      theme
    });

    const baseUrl = window.location.origin;
    this.iframe.src = `${baseUrl}/tokenization-widget?${params.toString()}`;
  }

  private setupMessageListener() {
    window.addEventListener('message', (event) => {
      if (event.data.type === 'tokenization-step-click') {
        // Dispatch custom event for parent application
        this.dispatchEvent(new CustomEvent('step-click', {
          detail: event.data.data,
          bubbles: true
        }));
      }
    });
  }

  private setupResizeObserver() {
    if (!window.ResizeObserver) return;

    this.resizeObserver = new ResizeObserver(() => {
      // Auto-adjust iframe height based on content if needed
      // This is optional and depends on your use case
    });

    this.resizeObserver.observe(this);
  }

  private cleanup() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }
}

// Register the custom element
if (typeof window !== 'undefined' && 'customElements' in window) {
  customElements.define('tokenization-flow', TokenizationFlowElement);
}

// Export for module systems
export { TokenizationFlowElement };

// Usage examples:
/*
// HTML Usage:
<tokenization-flow 
  property-id="abc123" 
  compact="false" 
  auto-refresh="true" 
  theme="auto"
  height="350px">
</tokenization-flow>

// JavaScript Usage:
const widget = document.createElement('tokenization-flow');
widget.setAttribute('property-id', 'abc123');
widget.addEventListener('step-click', (event) => {
  console.log('Step clicked:', event.detail);
});
document.body.appendChild(widget);

// React Usage (in external apps):
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'tokenization-flow': {
        'property-id'?: string;
        'compact'?: string;
        'auto-refresh'?: string;
        'theme'?: string;
        'height'?: string;
        'onStep-click'?: (event: CustomEvent) => void;
      };
    }
  }
}

function MyComponent() {
  return (
    <tokenization-flow
      property-id="abc123"
      compact="false"
      auto-refresh="true"
      theme="auto"
      onStep-click={(e) => console.log(e.detail)}
    />
  );
}
*/