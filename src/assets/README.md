# App Assets

This directory contains the application assets such as images, icons, and splash screens.

## Required Assets

Please add the following assets to this directory:

1. `icon.png` - App icon (1024x1024px recommended)
2. `splash.png` - Splash screen image (centered logo, 1242x2436px recommended)
3. `adaptive-icon.png` - Android adaptive icon (foreground image, 1024x1024px)
4. `favicon.png` - Web favicon (192x192px)

## Asset Guidelines

- Use PNG format with transparency where needed
- Make sure icons are clear and recognizable at small sizes
- The splash screen should be simple and centered
- Follow platform-specific guidelines for icons

## Asset Generation

You can use tools like [Figma](https://www.figma.com/) or [Adobe XD](https://www.adobe.com/products/xd.html) to design your assets.

For generating all the required sizes for different platforms, consider using:

- [App Icon Generator](https://appicon.co/)
- [Expo's Image Tools](https://docs.expo.dev/guides/icons/)

After generating the assets, update the paths in `app.json` if necessary.
