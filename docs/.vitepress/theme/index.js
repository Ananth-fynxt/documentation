import DefaultTheme from 'vitepress/theme'
import '../style.css'
import { onMounted, watch } from 'vue'
import { useRoute } from 'vitepress'

export default {
  ...DefaultTheme,
  setup() {
    const route = useRoute()
    
    const isHomePage = () => {
      return route.path === '/' || document.querySelector('.VPContent.is-home')
    }
    
    const loadSplineViewer = () => {
      if (!isHomePage()) {
        // Remove Spline viewer if not on home page
        const existingViewer = document.querySelector('spline-viewer')
        if (existingViewer) {
          existingViewer.remove()
        }
        return
      }
      
      // Only add Spline viewer on home page
      if (!document.querySelector('spline-viewer')) {
        const splineViewer = document.createElement('spline-viewer')
        splineViewer.setAttribute('url', '/assets/bg.splinecode')
        document.body.appendChild(splineViewer)
      }
    }
    
    onMounted(() => {
      // Load Spline viewer script if not already loaded
      if (!document.querySelector('script[src*="spline-viewer"]')) {
        const script = document.createElement('script')
        script.type = 'module'
        script.src = 'https://unpkg.com/@splinetool/viewer@1.12.2/build/spline-viewer.js'
        document.head.appendChild(script)
        
        // Wait for script to load, then create Spline viewer
        script.onload = () => {
          loadSplineViewer()
        }
      } else {
        // Script already loaded
        loadSplineViewer()
      }
      
      // Watch for route changes
      watch(() => route.path, () => {
        // Small delay to ensure DOM is updated
        setTimeout(() => {
          loadSplineViewer()
        }, 100)
      })
      
      // Also observe VPContent changes to catch navigation
      const observer = new MutationObserver((mutations) => {
        // Only react if class changes on VPContent
        const hasClassChange = mutations.some(mutation => 
          mutation.type === 'attributes' && 
          mutation.attributeName === 'class' &&
          mutation.target.classList?.contains('VPContent')
        )
        if (hasClassChange) {
          loadSplineViewer()
        }
      })
      
      // Observe the app container for class changes
      const appContainer = document.querySelector('#app')
      if (appContainer) {
        observer.observe(appContainer, {
          attributes: true,
          attributeFilter: ['class'],
          subtree: true
        })
      }
    })
  }
}

