const fs = require("fs");
const path = require("path");
const { withDangerousMod, withInfoPlist } = require("@expo/config-plugins");

const sceneDelegate = `
public class SceneDelegate: UIResponder, UIWindowSceneDelegate {
  public var window: UIWindow?

  public func scene(
    _ scene: UIScene,
    willConnectTo session: UISceneSession,
    options connectionOptions: UIScene.ConnectionOptions
  ) {
    guard let windowScene = scene as? UIWindowScene,
          let appDelegate = UIApplication.shared.delegate as? AppDelegate,
          let factory = appDelegate.reactNativeFactory else { return }

    let window = UIWindow(windowScene: windowScene)
    self.window = window
    appDelegate.window = window
    factory.startReactNative(
      withModuleName: "main",
      in: window,
      launchOptions: nil
    )
  }
}

`;

function withSceneLifecycle(config) {
  config = withInfoPlist(config, (mod) => {
    mod.modResults.UIApplicationSceneManifest = {
      UIApplicationSupportsMultipleScenes: false,
      UISceneConfigurations: {
        UIWindowSceneSessionRoleApplication: [
          {
            UISceneConfigurationName: "Default Configuration",
            UISceneDelegateClassName: "$(PRODUCT_MODULE_NAME).SceneDelegate",
          },
        ],
      },
    };
    return mod;
  });

  return withDangerousMod(config, ["ios", async (mod) => {
    const projectName = mod.modRequest.projectName;
    const appDelegatePath = path.join(
      mod.modRequest.platformProjectRoot,
      projectName,
      "AppDelegate.swift"
    );
    let source = fs.readFileSync(appDelegatePath, "utf8");
    source = source.replace(
      /#if os\(iOS\) \|\| os\(tvOS\)[\s\S]*?#endif\n/,
      ""
    );
    if (!source.includes("public class SceneDelegate")) {
      source = source.replace("class ReactNativeDelegate", `${sceneDelegate}class ReactNativeDelegate`);
    }
    fs.writeFileSync(appDelegatePath, source);
    return mod;
  }]);
}

module.exports = withSceneLifecycle;
