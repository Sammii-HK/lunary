import UIKit
import Capacitor
import WebKit

class LunaryBridgeViewController: CAPBridgeViewController {

    override func viewDidLoad() {
        super.viewDidLoad()

        // Register the native message handler for widget data
        webView?.configuration.userContentController.add(
            WidgetDataBridge.shared,
            name: "widgetBridge"
        )
        print("[Lunary] widgetBridge message handler registered")
    }
}
