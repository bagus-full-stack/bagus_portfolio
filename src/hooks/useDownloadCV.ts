import { useState } from 'react'
import { supabase } from '../services/supabase.service'
import { CV_CONFIG, CVType } from '../config/cv.config'
import { toast } from 'sonner'

const useDownloadCV = () => {
  const [loading, setLoading] = useState<CVType | null>(null)

  const downloadCV = async (type: CVType) => {
    setLoading(type)
    const config = CV_CONFIG[type]

    try {
      const { data, error } = await supabase
        .storage
        .from('cv')
        .createSignedUrl(config.filename, 3600)

      if (error) throw error
      if (!data?.signedUrl) throw new Error('URL non générée')

      const link = document.createElement('a')
      link.href = data.signedUrl
      link.download = config.downloadName
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast.success(`${config.langFlag} ${config.label} téléchargé ✅`)
    } catch {
      toast.error('Téléchargement impossible')
    } finally {
      setLoading(null)
    }
  }

  return { downloadCV, loading }
}

export default useDownloadCV
