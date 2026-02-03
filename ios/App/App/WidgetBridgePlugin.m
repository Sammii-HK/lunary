#import <Foundation/Foundation.h>
#import <Capacitor/Capacitor.h>

CAP_PLUGIN(WidgetBridgePlugin, "WidgetBridge",
           CAP_PLUGIN_METHOD(setWidgetData, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(getWidgetData, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(reloadWidgets, CAPPluginReturnPromise);
)
