# Graph Report - .  (2026-04-22)

## Corpus Check
- 112 files · ~158,069 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 68 nodes · 54 edges · 12 communities detected
- Extraction: 94% EXTRACTED · 6% INFERRED · 0% AMBIGUOUS · INFERRED: 3 edges (avg confidence: 0.83)
- Token cost: 1,200 input · 450 output

## Community Hubs (Navigation)
- [[_COMMUNITY_iOS Native Infrastructure|iOS Native Infrastructure]]
- [[_COMMUNITY_Application Logic (App.tsx)|Application Logic (App.tsx)]]
- [[_COMMUNITY_PDF Report Generation|PDF Report Generation]]
- [[_COMMUNITY_Android Activity Infrastructure|Android Activity Infrastructure]]
- [[_COMMUNITY_Image Selection & Permissions|Image Selection & Permissions]]
- [[_COMMUNITY_Android Application Lifecycle|Android Application Lifecycle]]
- [[_COMMUNITY_LULC Prediction Service|LULC Prediction Service]]
- [[_COMMUNITY_Project Metadata & Tools|Project Metadata & Tools]]
- [[_COMMUNITY_App Settings UI|App Settings UI]]
- [[_COMMUNITY_Dataset Selection UI|Dataset Selection UI]]
- [[_COMMUNITY_Splash Screen UI|Splash Screen UI]]
- [[_COMMUNITY_Technical Specs UI|Technical Specs UI]]

## God Nodes (most connected - your core abstractions)
1. `ReactNativeDelegate` - 6 edges
2. `AppDelegate` - 5 edges
3. `MainActivity` - 4 edges
4. `handlePredict()` - 3 edges
5. `MainApplication` - 3 edges
6. `requestAndroidPermissions()` - 3 edges
7. `handlePickImage()` - 3 edges
8. `handleExportPDF()` - 3 edges
9. `LulcService` - 3 edges
10. `generateProfessionalReport()` - 3 edges

## Surprising Connections (you probably didn't know these)
- `handleExportPDF()` --calls--> `generateProfessionalReport()`  [INFERRED]
  E:\FYP\Mobile App\LulcRecognition\src\components\PredictionResults.tsx → E:\FYP\Mobile App\LulcRecognition\src\utils\reportGenerator.ts

## Communities

### Community 0 - "iOS Native Infrastructure"
Cohesion: 0.27
Nodes (5): AppDelegate, ReactNativeDelegate, RCTDefaultReactNativeFactoryDelegate, UIApplicationDelegate, UIResponder

### Community 1 - "Application Logic (App.tsx)"
Cohesion: 0.53
Nodes (4): App(), handleClear(), handleImageSelected(), handlePredict()

### Community 2 - "PDF Report Generation"
Cohesion: 0.33
Nodes (2): handleExportPDF(), generateProfessionalReport()

### Community 3 - "Android Activity Infrastructure"
Cohesion: 0.4
Nodes (1): MainActivity

### Community 4 - "Image Selection & Permissions"
Cohesion: 0.7
Nodes (3): clearImage(), handlePickImage(), requestAndroidPermissions()

### Community 5 - "Android Application Lifecycle"
Cohesion: 0.5
Nodes (1): MainApplication

### Community 6 - "LULC Prediction Service"
Cohesion: 0.5
Nodes (1): LulcService

### Community 7 - "Project Metadata & Tools"
Cohesion: 0.5
Nodes (4): App Icon Assets, CocoaPods, Metro Bundler, React Native

### Community 8 - "App Settings UI"
Cohesion: 0.67
Nodes (1): AppSettings()

### Community 9 - "Dataset Selection UI"
Cohesion: 0.67
Nodes (1): DatasetSelector()

### Community 10 - "Splash Screen UI"
Cohesion: 0.67
Nodes (1): LottieSplashScreen()

### Community 11 - "Technical Specs UI"
Cohesion: 0.67
Nodes (1): TechnicalSpecs()

## Knowledge Gaps
- **2 isolated node(s):** `Metro Bundler`, `CocoaPods`
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `PDF Report Generation`** (6 nodes): `PredictionResults.tsx`, `reportGenerator.ts`, `handleExportPDF()`, `generateProfessionalReport()`, `PredictionResults.tsx`, `reportGenerator.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Android Activity Infrastructure`** (5 nodes): `MainActivity.kt`, `MainActivity.kt`, `MainActivity`, `.createReactActivityDelegate()`, `.getMainComponentName()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Android Application Lifecycle`** (4 nodes): `MainApplication.kt`, `MainApplication.kt`, `MainApplication`, `.onCreate()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `LULC Prediction Service`** (4 nodes): `lulcService.ts`, `LulcService`, `.predict()`, `lulcService.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `App Settings UI`** (3 nodes): `AppSettings()`, `AppSettings.tsx`, `AppSettings.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Dataset Selection UI`** (3 nodes): `DatasetSelector()`, `DatasetSelector.tsx`, `DatasetSelector.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Splash Screen UI`** (3 nodes): `LottieSplashScreen.tsx`, `LottieSplashScreen()`, `LottieSplashScreen.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Technical Specs UI`** (3 nodes): `TechnicalSpecs.tsx`, `TechnicalSpecs.tsx`, `TechnicalSpecs()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `handlePredict()` connect `Application Logic (App.tsx)` to `LULC Prediction Service`?**
  _High betweenness centrality (0.009) - this node is a cross-community bridge._
- **What connects `Metro Bundler`, `CocoaPods` to the rest of the system?**
  _2 weakly-connected nodes found - possible documentation gaps or missing edges._