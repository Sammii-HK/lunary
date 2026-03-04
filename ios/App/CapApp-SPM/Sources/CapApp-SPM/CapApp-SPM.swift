import RevenuecatPurchasesCapacitor

public let isCapacitorApp = true

// Keeps PurchasesPlugin linked into the binary so NSClassFromString finds it at runtime.
// Uses @_optimize(none) to avoid a Swift 6.2 compiler crash in DeadFunctionAndGlobalElimination.
// Called from AppDelegate.application(_:didFinishLaunchingWithOptions:).
@_optimize(none)
public func _keepPurchasesPlugin() {
    _ = PurchasesPlugin.self
}
