// apps/api/src/services/ml.service.ts
export class MLService {
    private imageifyUrl = process.env.IMAGEIFY_URL || 'http://localhost:5000'
    private metricMuseUrl = process.env.METRICMUSE_URL || 'http://localhost:5001'
  
    async generateImage(prompt: string) {
      try {
        const response = await fetch(`${this.imageifyUrl}/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt })
        })
        return response.json()
      } catch (error) {
        console.error('Image generation failed:', error)
        throw new Error('Image generation failed')
      }
    }
  
    async analyzeContent(content: string) {
      try {
        const response = await fetch(`${this.metricMuseUrl}/analyze`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content })
        })
        return response.json()
      } catch (error) {
        console.error('Content analysis failed:', error)
        throw new Error('Content analysis failed')
      }
    }
  }