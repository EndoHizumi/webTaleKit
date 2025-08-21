# WebTaleKit イベント発火機能 仕様書

## 概要

WebTaleKitのフロントエンドフレームワーク向けイベント発火機能の完全仕様です。全メソッド実行時に前後でイベントを発火し、キューベースで順次処理を行います。

## 1. 対象メソッドの範囲

### 対象クラス
- **Core クラス**: メインゲームエンジン
- **ScenarioManager クラス**: シナリオ管理
- **Drawer クラス**: 描画処理
- **ResourceManager クラス**: リソース管理
- **ImageObject クラス**: 画像オブジェクト
- **SoundObject クラス**: 音声オブジェクト

### 対象メソッド
各クラスの全メソッド（constructorを除く）

#### Core クラスの主要メソッド
- `textHandler`, `choiceHandler`, `showHandler`, `hideHandler`
- `jumpHandler`, `soundHandler`, `sayHandler`, `ifHandler`
- `callHandler`, `moveToHandler`, `routeHandler`, `waitHandler`
- `dialogHandler`, `newpageHandler`, `executeCode`
- `setBackground`, `getBackground` など

#### ScenarioManager クラスの主要メソッド
- `setScenario`, `addScenario`, `getScenario`
- `next`, `hasNext`, `getIndex`, `setIndex`
- `setSceneName`, `getSceneName`, `setHistory`
- `setSelectedChoice` など

#### Drawer クラスの主要メソッド
- `drawName`, `drawText`, `drawChoices`
- `fadeIn`, `fadeOut`, `show`, `moveTo`
- `clear`, `drawCanvas`, `setVisibility` など

## 2. イベント仕様

### イベントタイミング
- **メソッド実行前**: `method:before`
- **メソッド実行後**: `method:after`

### イベントデータ構造
```typescript
interface EventData {
  eventType: 'method:before' | 'method:after'
  className: string      // 'Core', 'Drawer', 'ScenarioManager' など
  methodName: string     // 'textHandler', 'drawText' など
  arguments: any[]       // メソッドの引数配列
  result?: any          // 実行結果（afterのみ）
  timestamp: number      // 実行タイムスタンプ
  executionTime?: number // 実行時間（afterのみ、ms）
  id: string            // イベント固有ID
}
```

### イベント名規則
- **実行前**: `webtalekit:method:before`
- **実行後**: `webtalekit:method:after`

## 3. キューベースのイベント発火機構

### EventQueue クラス
```typescript
interface EventData {
  eventType: 'method:before' | 'method:after'
  className: string
  methodName: string
  arguments: any[]
  result?: any
  timestamp: number
  executionTime?: number
  id: string
}

class EventQueue {
  private queue: EventData[] = []
  private isProcessing: boolean = false
  private maxQueueSize: number = 1000
  private batchSize: number = 10
  
  enqueue(event: EventData): void {
    // キューサイズ制限
    if (this.queue.length >= this.maxQueueSize) {
      this.queue.shift() // 古いイベントを削除
    }
    
    this.queue.push(event)
    
    if (!this.isProcessing) {
      this.processQueue()
    }
  }
  
  private async processQueue(): Promise<void> {
    this.isProcessing = true
    
    while (this.queue.length > 0) {
      const batch = this.queue.splice(0, this.batchSize)
      
      // バッチ処理で複数イベントを同時発火
      await Promise.all(
        batch.map(event => this.dispatchEvent(event))
      )
      
      // CPU負荷を軽減するための遅延
      if (this.queue.length > 0) {
        await new Promise(resolve => setTimeout(resolve, 1))
      }
    }
    
    this.isProcessing = false
  }
  
  private async dispatchEvent(event: EventData): Promise<void> {
    const customEvent = new CustomEvent(`webtalekit:${event.eventType}`, {
      detail: event,
      bubbles: false,
      cancelable: false
    })
    
    // 非同期でイベント発火
    setTimeout(() => {
      document.dispatchEvent(customEvent)
    }, 0)
  }
}
```

### EventEmitter クラス
```typescript
class EventEmitter {
  private static instance: EventEmitter
  private eventQueue: EventQueue = new EventQueue()
  private eventId: number = 0
  
  static getInstance(): EventEmitter {
    if (!EventEmitter.instance) {
      EventEmitter.instance = new EventEmitter()
    }
    return EventEmitter.instance
  }
  
  emitBefore(className: string, methodName: string, args: any[]): string {
    const eventId = this.generateEventId()
    const event: EventData = {
      eventType: 'method:before',
      className,
      methodName,
      arguments: args,
      timestamp: performance.now(),
      id: eventId
    }
    
    this.eventQueue.enqueue(event)
    return eventId
  }
  
  emitAfter(eventId: string, className: string, methodName: string, 
           args: any[], result: any, startTime: number): void {
    const event: EventData = {
      eventType: 'method:after',
      className,
      methodName,
      arguments: args,
      result,
      timestamp: performance.now(),
      executionTime: performance.now() - startTime,
      id: eventId
    }
    
    this.eventQueue.enqueue(event)
  }
  
  private generateEventId(): string {
    return `evt_${++this.eventId}_${Date.now()}`
  }
}
```

### メソッドラッパーの実装
```typescript
function withEventEmission(target: any, className: string) {
  const emitter = EventEmitter.getInstance()
  
  // クラスの全メソッドをラップ
  Object.getOwnPropertyNames(target.prototype).forEach(methodName => {
    if (methodName !== 'constructor' && 
        typeof target.prototype[methodName] === 'function') {
      
      const originalMethod = target.prototype[methodName]
      
      target.prototype[methodName] = function(...args: any[]) {
        const startTime = performance.now()
        const eventId = emitter.emitBefore(className, methodName, args)
        
        try {
          const result = originalMethod.apply(this, args)
          
          // Promiseの場合
          if (result instanceof Promise) {
            return result.then(resolvedResult => {
              emitter.emitAfter(eventId, className, methodName, 
                              args, resolvedResult, startTime)
              return resolvedResult
            }).catch(error => {
              emitter.emitAfter(eventId, className, methodName, 
                              args, error, startTime)
              throw error
            })
          } else {
            emitter.emitAfter(eventId, className, methodName, 
                            args, result, startTime)
            return result
          }
        } catch (error) {
          emitter.emitAfter(eventId, className, methodName, 
                          args, error, startTime)
          throw error
        }
      }
    }
  })
}
```

## 4. フロントエンド向けAPIインターフェース

### 基本的なイベントリスナー登録
```javascript
// 全メソッドの実行前後を監視
document.addEventListener('webtalekit:method:before', (event) => {
  const { className, methodName, arguments: args } = event.detail
  console.log(`[BEFORE] ${className}.${methodName}`, args)
})

document.addEventListener('webtalekit:method:after', (event) => {
  const { className, methodName, result, executionTime } = event.detail
  console.log(`[AFTER] ${className}.${methodName}`, result, `${executionTime}ms`)
})
```

### フィルタリング機能付きAPI
```javascript
// WebTaleKit専用のイベント管理クラス
class WebTaleKitEvents {
  // 特定のクラスのメソッドのみ監視
  onClassMethod(className, callback) {
    const handler = (event) => {
      if (event.detail.className === className) {
        callback(event.detail)
      }
    }
    document.addEventListener('webtalekit:method:before', handler)
    document.addEventListener('webtalekit:method:after', handler)
    
    return () => {
      document.removeEventListener('webtalekit:method:before', handler)
      document.removeEventListener('webtalekit:method:after', handler)
    }
  }
  
  // 特定のメソッドのみ監視
  onMethod(className, methodName, callback) {
    const handler = (event) => {
      const detail = event.detail
      if (detail.className === className && detail.methodName === methodName) {
        callback(detail)
      }
    }
    document.addEventListener('webtalekit:method:before', handler)
    document.addEventListener('webtalekit:method:after', handler)
    
    return () => {
      document.removeEventListener('webtalekit:method:before', handler)
      document.removeEventListener('webtalekit:method:after', handler)
    }
  }
  
  // beforeのみ監視
  onBefore(className, methodName, callback) {
    const handler = (event) => {
      const detail = event.detail
      if (detail.className === className && detail.methodName === methodName) {
        callback(detail)
      }
    }
    document.addEventListener('webtalekit:method:before', handler)
    
    return () => {
      document.removeEventListener('webtalekit:method:before', handler)
    }
  }
  
  // afterのみ監視
  onAfter(className, methodName, callback) {
    const handler = (event) => {
      const detail = event.detail
      if (detail.className === className && detail.methodName === methodName) {
        callback(detail)
      }
    }
    document.addEventListener('webtalekit:method:after', handler)
    
    return () => {
      document.removeEventListener('webtalekit:method:after', handler)
    }
  }
}

// グローバルに公開
window.WebTaleKitEvents = new WebTaleKitEvents()
```

### React向けのカスタムフック
```javascript
// React用カスタムフック
function useWebTaleKitMethod(className, methodName, eventType = 'both') {
  const [eventData, setEventData] = useState(null)
  
  useEffect(() => {
    const unsubscribers = []
    
    if (eventType === 'before' || eventType === 'both') {
      const unsubBefore = window.WebTaleKitEvents.onBefore(
        className, methodName, setEventData
      )
      unsubscribers.push(unsubBefore)
    }
    
    if (eventType === 'after' || eventType === 'both') {
      const unsubAfter = window.WebTaleKitEvents.onAfter(
        className, methodName, setEventData
      )
      unsubscribers.push(unsubAfter)
    }
    
    return () => {
      unsubscribers.forEach(unsub => unsub())
    }
  }, [className, methodName, eventType])
  
  return eventData
}

// 使用例
function GameDebugPanel() {
  const textEvent = useWebTaleKitMethod('Core', 'textHandler')
  const drawEvent = useWebTaleKitMethod('Drawer', 'drawText')
  
  return (
    <div>
      <div>Last text: {textEvent?.arguments?.[0]}</div>
      <div>Draw time: {drawEvent?.executionTime}ms</div>
    </div>
  )
}
```

### Vue.js向けのComposable
```javascript
// Vue 3 Composition API用
function useWebTaleKitEvents() {
  const events = ref([])
  const latestEvent = ref(null)
  
  const subscribe = (className, methodName, eventType = 'both') => {
    const unsubscribers = []
    
    const handler = (eventData) => {
      events.value.push(eventData)
      latestEvent.value = eventData
      
      // 最新100件のみ保持
      if (events.value.length > 100) {
        events.value.shift()
      }
    }
    
    if (eventType === 'before' || eventType === 'both') {
      unsubscribers.push(
        window.WebTaleKitEvents.onBefore(className, methodName, handler)
      )
    }
    
    if (eventType === 'after' || eventType === 'both') {
      unsubscribers.push(
        window.WebTaleKitEvents.onAfter(className, methodName, handler)
      )
    }
    
    return () => {
      unsubscribers.forEach(unsub => unsub())
    }
  }
  
  return {
    events: readonly(events),
    latestEvent: readonly(latestEvent),
    subscribe
  }
}
```

## 5. 実装手順

### 1. 初期化コード
```javascript
// 各クラスにイベント発火機能を追加
withEventEmission(Core, 'Core')
withEventEmission(Drawer, 'Drawer')  
withEventEmission(ScenarioManager, 'ScenarioManager')
withEventEmission(ResourceManager, 'ResourceManager')
withEventEmission(ImageObject, 'ImageObject')
withEventEmission(SoundObject, 'SoundObject')
```

### 2. 利用例

#### 基本的な使用方法
```javascript
document.addEventListener('webtalekit:method:before', (event) => {
  console.log('実行前:', event.detail)
})

document.addEventListener('webtalekit:method:after', (event) => {
  console.log('実行後:', event.detail)
})
```

#### 特定メソッドのみ監視
```javascript
const unsubscribe = window.WebTaleKitEvents.onMethod(
  'Core', 'textHandler', (eventData) => {
    console.log('テキスト表示:', eventData)
  }
)

// 監視停止
unsubscribe()
```

#### React での使用
```javascript
function MyComponent() {
  const textEvent = useWebTaleKitMethod('Core', 'textHandler')
  
  return (
    <div>
      {textEvent && (
        <p>最新のテキスト: {textEvent.arguments?.[0]}</p>
      )}
    </div>
  )
}
```

## 6. パフォーマンス考慮事項

### キューシステム
- **最大キューサイズ**: 1000イベント
- **バッチサイズ**: 10イベント/バッチ
- **バッチ間遅延**: 1ms

### メモリ管理
- 古いイベントの自動削除
- WeakRef使用による循環参照防止

### CPU負荷軽減
- 非同期イベント発火
- バッチ処理による効率化

## 7. 注意事項

- **非同期実行**: イベントは非同期で発火されるため、メソッド実行の直後に完了していない場合があります
- **エラー処理**: メソッドでエラーが発生した場合もafterイベントは発火され、resultにErrorオブジェクトが含まれます
- **パフォーマンス**: 大量のイベントが発生する場合、キューによる制御が行われます

## 8. 拡張可能性

この設計により以下の拡張が可能です：

- イベントフィルタリングの詳細化
- イベントの永続化（ログ保存）
- リアルタイム監視ダッシュボード
- デバッグツールとの連携
- メトリクス収集機能

---

**作成日**: 2025-08-08  
**バージョン**: 1.0.0