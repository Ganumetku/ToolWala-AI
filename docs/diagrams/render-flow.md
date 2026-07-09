# Render Flow Diagram

This diagram displays the render queue compiler, viewport active culling bounds checking, and batched scheduler frame painting.

```mermaid
graph TD
    triggerRedraw[Request Canvas Redraw Frame] --> scheduler[RenderScheduler.requestRender]
    scheduler -- Throttle to Frame -- compileQueue[RenderGraph.compileRenderQueue]
    
    compileQueue --> matrixCascade[Propagate SceneNodes matrices parent to child]
    matrixCascade --> boundsCheck[Check CullingManager.shouldCull against viewport limits]
    
    boundsCheck -- visible -- addQueue[Add SceneNode to Render Queue]
    boundsCheck -- offscreen -- skipNode[Cull & bypass node]
    
    addQueue --> sortQueue[Sort Render Queue: Page -> Layer container zIndex -> local zIndex]
    
    sortQueue --> clipBounds[DirtyRegionManager: set clipping context boundaries]
    clipBounds --> renderPass[RenderEngine: draw runs on canvas]
    
    renderPass --> textDraw[Render text using baseline offsets]
    renderPass --> imgDraw[Render image from decoders cache]
    renderPass --> pathDraw[Apply difference transforms to original Path2D paths]
    
    renderPass --> selectedCheck{Node matching selected ID?}
    selectedCheck -- Yes -- drawBB[BoundingBox: draw selection borders & handles]
    selectedCheck -- No -- loopDone[Draw Complete]
```
