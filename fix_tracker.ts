import fs from 'fs'

const file = 'src/components/HeroSection.tsx'
let data = fs.readFileSync(file, 'utf8')

// On va remplacer tout le bloc useEffect
data = data.replace(
  /  useEffect\(\(\) => \{\n    const trackAndCount.*?\n    trackAndCount\(\)\n  \}, \[\]\);/s,
  `  useEffect(() => {
    const trackAndCount = async () => {
      try {
        let fingerprint = localStorage.getItem('visitor_fingerprint');
        if (!fingerprint) {
          fingerprint = crypto.randomUUID().slice(0, 32);
          localStorage.setItem('visitor_fingerprint', fingerprint);
        }

        // Appel direct à increment_visitors qui gère l'unicité
        const { data, error } = await supabase.rpc('increment_visitors', {
          p_fingerprint: fingerprint,
          p_page: window.location.pathname,
          p_country: '',
          p_city: ''
        });

        if (!error && data?.total) {
          setViews(data.total);
        } else {
          setViews(0);
        }
      } catch (err) {
        setViews(0);
      }
    };
    trackAndCount();
  }, []);`
)

fs.writeFileSync(file, data)
