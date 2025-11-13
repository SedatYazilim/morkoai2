import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { Download, Home as HomeIcon, Loader2, Sparkles, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Link } from "wouter";

export default function Gallery() {
  const [selectedImage, setSelectedImage] = useState<{
    id: number;
    url: string;
    prompt: string;
  } | null>(null);

  const utils = trpc.useUtils();
  const { data: generations, isLoading } = trpc.generation.list.useQuery({ limit: 50 });

  const deleteMutation = trpc.generation.delete.useMutation({
    onSuccess: () => {
      utils.generation.list.invalidate();
      setSelectedImage(null);
      toast.success("Görsel silindi");
    },
    onError: (error) => {
      toast.error(`Hata: ${error.message}`);
    },
  });

  const handleDownload = async (url: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `morkoai-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);
      toast.success("Görsel indirildi! 📥");
    } catch (error) {
      toast.error("İndirme başarısız oldu");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center pixel-grid">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pixel-grid">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <HomeIcon className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold">Galeri</h1>
          </div>
        </div>
      </header>

      {/* Gallery Content */}
      <section className="container py-8">
        {!generations || generations.length === 0 ? (
          <div className="text-center py-20 space-y-4">
            <div className="w-20 h-20 mx-auto bg-muted flex items-center justify-center pixel-shadow">
              <Sparkles className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold">Henüz görsel yok</h2>
            <p className="text-muted-foreground">
              İlk görselinizi oluşturmak için ana sayfaya gidin
            </p>
            <Link href="/">
              <Button className="pixel-shadow">
                <Sparkles className="w-5 h-5 mr-2" />
                Görsel Oluştur
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <p className="text-muted-foreground">
                Toplam {generations.length} görsel
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {generations.map((gen) => (
                <Card
                  key={gen.id}
                  className="group cursor-pointer hover:border-primary transition-colors overflow-hidden"
                  onClick={() =>
                    setSelectedImage({
                      id: gen.id,
                      url: gen.imageUrl,
                      prompt: gen.prompt,
                    })
                  }
                >
                  <div className="aspect-square bg-muted relative overflow-hidden">
                    <img
                      src={gen.imageUrl}
                      alt={gen.prompt}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                      <Sparkles className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {gen.prompt}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(gen.createdAt).toLocaleDateString("tr-TR")}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </section>

      {/* Image Detail Dialog */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl p-0">
          {selectedImage && (
            <>
              <div className="aspect-square bg-muted">
                <img
                  src={selectedImage.url}
                  alt={selectedImage.prompt}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="p-6 space-y-4">
                <DialogHeader>
                  <DialogTitle className="text-lg">Görsel Detayları</DialogTitle>
                  <DialogDescription>
                    {selectedImage.prompt}
                  </DialogDescription>
                </DialogHeader>
                <div className="flex gap-3">
                  <Button
                    onClick={() => handleDownload(selectedImage.url)}
                    className="flex-1 pixel-shadow-sm"
                  >
                    <Download className="w-5 h-5 mr-2" />
                    İndir
                  </Button>
                  <Button
                    onClick={() => deleteMutation.mutate({ id: selectedImage.id })}
                    disabled={deleteMutation.isPending}
                    variant="destructive"
                    className="flex-1"
                  >
                    {deleteMutation.isPending ? (
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    ) : (
                      <Trash2 className="w-5 h-5 mr-2" />
                    )}
                    Sil
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
