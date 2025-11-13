import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { Loader2, Sparkles, Image as ImageIcon, Download } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Link } from "wouter";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const generateMutation = trpc.generation.generate.useMutation({
    onSuccess: (data) => {
      setGeneratedImage(data.imageUrl);
      toast.success("Görsel başarıyla oluşturuldu! 🎨");
    },
    onError: (error) => {
      toast.error(`Hata: ${error.message}`);
    },
  });

  const handleGenerate = () => {
    if (!prompt.trim()) {
      toast.error("Lütfen bir açıklama girin!");
      return;
    }
    setGeneratedImage(null);
    generateMutation.mutate({ prompt });
  };

  const handleDownload = async () => {
    if (!generatedImage) return;
    
    try {
      const response = await fetch(generatedImage);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `morkoai-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success("Görsel indirildi! 📥");
    } catch (error) {
      toast.error("İndirme başarısız oldu");
    }
  };

  return (
    <div className="min-h-screen pixel-grid">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary flex items-center justify-center pixel-shadow-sm">
              <Sparkles className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold">MorkoAI</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/gallery">
              <Button variant="ghost" size="sm">
                Galeri
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container py-12 md:py-20">
        <div className="text-center mb-12 space-y-6">
          <div className="inline-block">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-primary via-accent to-secondary flex items-center justify-center pixel-shadow mb-6 float">
              <ImageIcon className="w-12 h-12 text-white" />
            </div>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Hayal Et, Oluştur
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Yapay zeka ile metinden görsel oluşturun. Tamamen ücretsiz, sınırsız kullanım.
          </p>
        </div>

        {/* Generator Card */}
        <Card className="max-w-4xl mx-auto pixel-shadow bg-card/80 backdrop-blur">
          <CardContent className="p-6 md:p-8 space-y-6">
            <div className="space-y-3">
              <Label htmlFor="prompt" className="text-base">
                Görsel Açıklaması
              </Label>
              <Textarea
                id="prompt"
                placeholder="Örnek: Uzayda yüzen bir kedi, pixel art tarzında, canlı renkler..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={4}
                className="resize-none"
                disabled={generateMutation.isPending}
              />
              <p className="text-sm text-muted-foreground">
                Ne görmek istediğinizi detaylı bir şekilde açıklayın
              </p>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={generateMutation.isPending || !prompt.trim()}
              size="lg"
              className="w-full pixel-shadow"
            >
              {generateMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Oluşturuluyor...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Görsel Oluştur
                </>
              )}
            </Button>

            {/* Generated Image Display */}
            {(generatedImage || generateMutation.isPending) && (
              <div className="space-y-4">
                <div className="relative aspect-square bg-muted rounded-none overflow-hidden pixel-border">
                  {generateMutation.isPending ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center space-y-4">
                        <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
                        <p className="text-sm text-muted-foreground">
                          Yapay zeka görseli oluşturuyor...
                        </p>
                      </div>
                    </div>
                  ) : generatedImage ? (
                    <>
                      <img
                        src={generatedImage}
                        alt="Generated"
                        className="w-full h-full object-contain"
                      />
                      <div className="absolute top-4 right-4">
                        <Button
                          onClick={handleDownload}
                          size="icon"
                          className="pixel-shadow-sm"
                        >
                          <Download className="w-5 h-5" />
                        </Button>
                      </div>
                    </>
                  ) : null}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 max-w-4xl mx-auto">
          <Card className="bg-card/60 backdrop-blur border-2">
            <CardContent className="p-6 text-center space-y-3">
              <div className="w-12 h-12 mx-auto bg-primary/20 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-base font-semibold">Ücretsiz</h3>
              <p className="text-sm text-muted-foreground">
                Sınırsız görsel oluşturun, ödeme yok
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/60 backdrop-blur border-2">
            <CardContent className="p-6 text-center space-y-3">
              <div className="w-12 h-12 mx-auto bg-green-500/20 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-green-500" />
              </div>
              <h3 className="text-base font-semibold">Hızlı</h3>
              <p className="text-sm text-muted-foreground">
                Saniyeler içinde görsel oluşturun
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/60 backdrop-blur border-2">
            <CardContent className="p-6 text-center space-y-3">
              <div className="w-12 h-12 mx-auto bg-orange-500/20 flex items-center justify-center">
                <Download className="w-6 h-6 text-orange-500" />
              </div>
              <h3 className="text-base font-semibold">Kaydet</h3>
              <p className="text-sm text-muted-foreground">
                Tüm görselleriniz kaydedilir
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 mt-20">
        <div className="container text-center text-sm text-muted-foreground">
          <p>Powered by Pollinations AI • MorkoAI</p>
          <p className="mt-2">
            Instagram: <a href="https://www.instagram.com/morkolips/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">@morkolips</a> | 
            GitHub: <a href="https://github.com/SedatYazilim/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">SedatYazilim</a>
          </p>
          <p className="mt-1">
            İletişim: <a href="mailto:info@sedatdag.com.tr" className="text-primary hover:underline">info@sedatdag.com.tr</a>
          </p>
        </div>
      </footer>
    </div>
  );
}
