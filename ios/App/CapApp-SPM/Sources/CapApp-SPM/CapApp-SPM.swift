import RevenuecatPurchasesCapacitor

public let isCapacitorApp = true
// Force the linker to include PurchasesPlugin so NSClassFromString finds it at runtime.
// SourceKit may show a false "No such module" error here — ignore it. The build will succeed.
public let _purchasesPluginClass: AnyClass = PurchasesPlugin.self
