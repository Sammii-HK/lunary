import UIKit
import Capacitor
import WebKit

class LunaryBridgeViewController: CAPBridgeViewController, WKNavigationDelegate {

    override func capacitorDidLoad() {
        super.capacitorDidLoad()
        bridge?.registerPluginType(SignInWithApplePlugin.self)
    }

    override func viewDidLoad() {
        super.viewDidLoad()

        // Set ourselves as the navigation delegate
        webView?.navigationDelegate = self

        // Register the native message handler for widget data
        webView?.configuration.userContentController.add(
            WidgetDataBridge.shared,
            name: "widgetBridge"
        )
        print("[Lunary] widgetBridge message handler registered")
        print("[Lunary] Navigation delegate set to LunaryBridgeViewController")
    }

    // MARK: - WKNavigationDelegate

    func webView(_ webView: WKWebView, decidePolicyFor navigationAction: WKNavigationAction, decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
        guard let url = navigationAction.request.url else {
            decisionHandler(.cancel)
            return
        }

        // Allow all lunary.app URLs to navigate within the WebView
        if let host = url.host, host.contains("lunary.app") {
            print("[Lunary] Allowing internal navigation to: \(url.absoluteString)")
            decisionHandler(.allow)
            return
        }

        // Allow localhost for development
        if let host = url.host, host == "localhost" || host == "127.0.0.1" {
            print("[Lunary] Allowing localhost navigation to: \(url.absoluteString)")
            decisionHandler(.allow)
            return
        }

        // For capacitor:// and ionic:// schemes (internal)
        if let scheme = url.scheme, scheme == "capacitor" || scheme == "ionic" {
            print("[Lunary] Allowing Capacitor scheme: \(url.absoluteString)")
            decisionHandler(.allow)
            return
        }

        // For external links (not lunary.app), open in Safari
        if navigationAction.navigationType == .linkActivated {
            print("[Lunary] Opening external link in Safari: \(url.absoluteString)")
            UIApplication.shared.open(url, options: [:], completionHandler: nil)
            decisionHandler(.cancel)
            return
        }

        // Default: allow
        print("[Lunary] Allowing navigation (default): \(url.absoluteString)")
        decisionHandler(.allow)
    }
}
