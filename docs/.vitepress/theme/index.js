import DefaultTheme from 'vitepress/theme'
import '../style.css'
import { onMounted, watch, nextTick } from 'vue'
import { useRoute } from 'vitepress'

export default {
  ...DefaultTheme,
  setup() {
    const route = useRoute()
    let splineViewer = null
    let isInitialized = false
    
    const isHomePage = () => {
      return route.path === '/' || document.querySelector('.VPContent.is-home')
    }
    
    const toggleSplineViewer = () => {
      if (!splineViewer) return
      
      const isHome = isHomePage()
      if (isHome) {
        splineViewer.style.display = 'block'
        document.body.classList.add('spline-active')
      } else {
        splineViewer.style.display = 'none'
        document.body.classList.remove('spline-active')
      }
    }
    
    const initializeSplineViewer = () => {
      if (isInitialized) {
        toggleSplineViewer()
        return
      }
      
      // Check if Spline viewer already exists in DOM
      splineViewer = document.querySelector('spline-viewer')
      
      if (!splineViewer) {
        // Create Spline viewer only once
        splineViewer = document.createElement('spline-viewer')
        splineViewer.setAttribute('url', '/documentation/assets/bg.splinecode')
          document.body.appendChild(splineViewer)
          const viewer = document.querySelector('spline-viewer'); 
          if (viewer && viewer.shadowRoot) { 
            const logo = viewer.shadowRoot.querySelector('#logo');
            if (logo) {
              logo.remove();
              console.log("Logo removed!");
            }
          }
      }
      
      isInitialized = true
      toggleSplineViewer()
    }
    
    onMounted(() => {
      // Load Spline viewer script if not already loaded
      if (!document.querySelector('script[src*="spline-viewer"]')) {
        const script = document.createElement('script')
        script.type = 'module'
        script.src = 'https://unpkg.com/@splinetool/viewer@latest/build/spline-viewer.js'
        document.head.appendChild(script)
        
        // Wait for script to load, then initialize Spline viewer
        script.onload = () => {
          nextTick(() => {
            initializeSplineViewer()
          })
        }
      } else {
        // Script already loaded
        nextTick(() => {
          initializeSplineViewer()
        })
      }
      
      // Watch for route changes - optimized with debounce
      let routeChangeTimeout
      watch(() => route.path, () => {
        clearTimeout(routeChangeTimeout)
        routeChangeTimeout = setTimeout(() => {
          nextTick(() => {
            toggleSplineViewer()
          })
        }, 50)
      })
      
      // Observe VPContent class changes for home page detection - debounced
      let observerTimeout
      const observer = new MutationObserver((mutations) => {
        // Only react if class changes on VPContent
        const hasRelevantChange = mutations.some(mutation => 
          mutation.type === 'attributes' && 
          mutation.attributeName === 'class' &&
          mutation.target.classList?.contains('VPContent')
        )
        
        if (hasRelevantChange && isInitialized) {
          clearTimeout(observerTimeout)
          observerTimeout = setTimeout(() => {
            nextTick(() => {
              toggleSplineViewer()
            })
          }, 50)
        }
      })
      
      // Observe the app container for class changes
      const appContainer = document.querySelector('#app')
      if (appContainer) {
        observer.observe(appContainer, {
          attributes: true,
          attributeFilter: ['class'],
          subtree: true,
          childList: false
        })
      }
    })
  }
}


// const interval = setInterval(() => { 
//   const viewer = document.querySelector('spline-viewer'); 
//   if (viewer && viewer.shadowRoot) { 
//     const logo = viewer.shadowRoot.querySelector('#logo'); 
//     if (logo) { 
//       logo.remove(); 
//       console.log("Logo removed!"); 
//       clearInterval(interval); 
//     } 
//   } 
// }, 500); 