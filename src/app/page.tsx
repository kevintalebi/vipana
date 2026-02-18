import Link from "next/link";
import Image from "next/image";
import { 
  Zap, 
  Image as ImageIcon, 
  Video, 
  FileText,
  Brain,
  Sparkles,
  ArrowRight,
  Play,
  Download
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen relative overflow-hidden" style={{
      backgroundImage: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 25%, #16213e 50%, #1a1a2e 75%, #0a0a0f 100%)',
      backgroundSize: '400% 400%',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
      animation: 'gradient-shift 15s ease infinite'
    }}>
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl bg-cyan-500/10 animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-80 h-80 rounded-full blur-3xl bg-purple-500/10 animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-1/4 left-1/3 w-64 h-64 rounded-full blur-3xl bg-green-500/10 animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      {/* Hero Section */}
      <section className="relative z-10 min-h-screen flex items-center justify-center px-4 py-20">
        <div className="max-w-6xl w-full text-center">
          {/* Main Title */}
          <div className="mb-16">
            <div className="w-24 h-24 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-cyan-500/25">
              <Brain className="w-12 h-12 text-white" />
          </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 neon-text">
              ویپانا
          </h1>
            <h2 className="text-2xl md:text-4xl font-semibold text-cyan-300 mb-4">
              ارایه دهنده سرویس های هوش مصنوعی
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              پلتفرم پیشرو در ارائه خدمات هوش مصنوعی با راهکارهای نوین برای بهینه‌سازی کسب‌وکارها
          </p>
        </div>

          {/* CTA Button */}
          <div className="mb-20">
          <Link
            href="/login"
              className="inline-flex items-center gap-3 px-12 py-6 text-2xl font-bold text-white rounded-2xl transition-all duration-300 shadow-2xl shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #00f5ff, #0066ff)',
                border: '2px solid transparent',
                backgroundImage: 'linear-gradient(135deg, #00f5ff, #0066ff) padding-box, linear-gradient(45deg, #00f5ff, #DAF527, #00ff88, #DAF527) border-box',
                animation: 'neon-border 24s ease-in-out infinite'
              }}
            >
              <Zap className="w-8 h-8" />
              <span>شروع کنید</span>
              <ArrowRight className="w-8 h-8" />
          </Link>
          </div>
        </div>
      </section>

      {/* AI Services Section */}
      <section className="relative z-10 py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold neon-text mb-6">
              سرویس‌های هوش مصنوعی
            </h2>
            <p className="text-xl text-gray-300">
              پلتفرم جامع تولید محتوا با هوش مصنوعی
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Text Generation */}
            <div className="glass border border-cyan-500/30 rounded-2xl p-8 text-center hover:shadow-2xl hover:shadow-cyan-500/20 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/25">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">تولید متن</h3>
              <p className="text-gray-300 mb-6">
                تولید محتوای متنی با پیشرفته‌ترین مدل‌های زبانی
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm">GPT</span>
                <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm">Gemini</span>
                <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm">DeepSeek</span>
                <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm">Claude</span>
              </div>
            </div>

            {/* Image Generation */}
            <div className="glass border border-cyan-500/30 rounded-2xl p-8 text-center hover:shadow-2xl hover:shadow-cyan-500/20 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-purple-500/25">
                <ImageIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">تولید تصویر</h3>
              <p className="text-gray-300 mb-6">
                خلق تصاویر هنری و واقعی با هوش مصنوعی
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm">Nano Banana</span>
                <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm">GPT Image</span>
                <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm">Flux</span>
                <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm">Midjourney</span>
              </div>
        </div>

            {/* Video Generation */}
            <div className="glass border border-cyan-500/30 rounded-2xl p-8 text-center hover:shadow-2xl hover:shadow-cyan-500/20 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-orange-500/25">
                <Video className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">تولید ویدیو</h3>
              <p className="text-gray-300 mb-6">
                تولید ویدیوهای خلاقانه و حرفه‌ای
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <span className="px-3 py-1 bg-orange-500/20 text-orange-300 rounded-full text-sm">Veo</span>
                <span className="px-3 py-1 bg-orange-500/20 text-orange-300 rounded-full text-sm">Kling</span>
                <span className="px-3 py-1 bg-orange-500/20 text-orange-300 rounded-full text-sm">Wan</span>
                <span className="px-3 py-1 bg-orange-500/20 text-orange-300 rounded-full text-sm">Runway</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Engines Section */}
      <section className="relative z-10 py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold neon-text mb-6">
              موتورهای هوش مصنوعی
            </h2>
            <p className="text-xl text-gray-300">
              پیشرفته‌ترین مدل‌های هوش مصنوعی در یک پلتفرم
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Text AI Engines */}
            <div className="glass border border-green-500/30 rounded-2xl p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center ml-4">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white">موتورهای متنی</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                  <span className="text-white font-medium">GPT</span>
                  <Sparkles className="w-5 h-5 text-green-400" />
                </div>
                <div className="flex items-center justify-between p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                  <span className="text-white font-medium">Gemini</span>
                  <Sparkles className="w-5 h-5 text-green-400" />
                </div>
                <div className="flex items-center justify-between p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                  <span className="text-white font-medium">DeepSeek</span>
                  <Sparkles className="w-5 h-5 text-green-400" />
                </div>
                <div className="flex items-center justify-between p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                  <span className="text-white font-medium">Claude</span>
                  <Sparkles className="w-5 h-5 text-green-400" />
                </div>
              </div>
            </div>

            {/* Image AI Engines */}
            <div className="glass border border-purple-500/30 rounded-2xl p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center ml-4">
                  <ImageIcon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white">موتورهای تصویری</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
                  <span className="text-white font-medium">Nano Banana</span>
                  <Sparkles className="w-5 h-5 text-purple-400" />
                </div>
                <div className="flex items-center justify-between p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
                  <span className="text-white font-medium">GPT Image 1</span>
                  <Sparkles className="w-5 h-5 text-purple-400" />
                </div>
                <div className="flex items-center justify-between p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
                  <span className="text-white font-medium">Flux</span>
                  <Sparkles className="w-5 h-5 text-purple-400" />
                </div>
                <div className="flex items-center justify-between p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
                  <span className="text-white font-medium">Midjourney</span>
                  <Sparkles className="w-5 h-5 text-purple-400" />
                </div>
              </div>
            </div>

            {/* Video AI Engines */}
            <div className="glass border border-orange-500/30 rounded-2xl p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center ml-4">
                  <Video className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white">موتورهای ویدیویی</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-orange-500/10 rounded-lg border border-orange-500/20">
                  <span className="text-white font-medium">Veo</span>
                  <Sparkles className="w-5 h-5 text-orange-400" />
                </div>
                <div className="flex items-center justify-between p-4 bg-orange-500/10 rounded-lg border border-orange-500/20">
                  <span className="text-white font-medium">Kling</span>
                  <Sparkles className="w-5 h-5 text-orange-400" />
                </div>
                <div className="flex items-center justify-between p-4 bg-orange-500/10 rounded-lg border border-orange-500/20">
                  <span className="text-white font-medium">Wan</span>
                  <Sparkles className="w-5 h-5 text-orange-400" />
                </div>
                <div className="flex items-center justify-between p-4 bg-orange-500/10 rounded-lg border border-orange-500/20">
                  <span className="text-white font-medium">Runway</span>
                  <Sparkles className="w-5 h-5 text-orange-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sample Works Section */}
      <section className="relative z-10 py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold neon-text mb-6">
              نمونه کارها
            </h2>
            <p className="text-xl text-gray-300">
              نمونه‌هایی از کارهای انجام شده با هوش مصنوعی
            </p>
          </div>
          
          {/* Sample Images Section */}
          <div className="glass border border-cyan-500/30 rounded-2xl p-8 mb-8">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center justify-center">
              <ImageIcon className="w-8 h-8 ml-3 text-cyan-400" />
              نمونه تصاویر تولید شده
            </h3>
              <div className="space-y-4">
                {/* First row - 4 images on desktop, 2 on mobile */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="relative group">
                    <Image
                      src="/samples/03c4caca-84a6-4656-b355-862a2b8cdcb7.png"
                      alt="AI Generated Image 1"
                      width={250}
                      height={250}
                      className="aspect-square object-cover rounded-lg border border-purple-500/30"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <Download className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="relative group">
                    <Image
                      src="/samples/0f72f686-1651-4157-be94-52e2cb6f00c5.png"
                      alt="AI Generated Image 2"
                      width={250}
                      height={250}
                      className="aspect-square object-cover rounded-lg border border-green-500/30"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <Download className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="relative group">
                    <Image
                      src="/samples/2d7f8652-b909-4541-b77c-53c5bc28e8b3.png"
                      alt="AI Generated Image 3"
                      width={250}
                      height={250}
                      className="aspect-square object-cover rounded-lg border border-orange-500/30"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <Download className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="relative group">
                    <Image
                      src="/samples/325993f7-5169-4399-bfe1-223b71e5c6f8.png"
                      alt="AI Generated Image 4"
                      width={250}
                      height={250}
                      className="aspect-square object-cover rounded-lg border border-cyan-500/30"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <Download className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>
                
                {/* Second row - 4 images on desktop, 2 on mobile */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="relative group">
                    <Image
                      src="/samples/43ed9aa8-70d1-46cc-a947-751a636237d7.png"
                      alt="AI Generated Image 5"
                      width={250}
                      height={250}
                      className="aspect-square object-cover rounded-lg border border-pink-500/30"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <Download className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="relative group">
                    <Image
                      src="/samples/49949c9a-fe00-4706-abe9-e980cb5782e7.png"
                      alt="AI Generated Image 6"
                      width={250}
                      height={250}
                      className="aspect-square object-cover rounded-lg border border-blue-500/30"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <Download className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="relative group">
                    <Image
                      src="/samples/4e25ca30-0de9-4e77-b4d6-31711ecc46c2.png"
                      alt="AI Generated Image 7"
                      width={250}
                      height={250}
                      className="aspect-square object-cover rounded-lg border border-emerald-500/30"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <Download className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="relative group">
                    <Image
                      src="/samples/52acac44-1877-47ec-b477-b888430e4659.png"
                      alt="AI Generated Image 8"
                      width={250}
                      height={250}
                      className="aspect-square object-cover rounded-lg border border-yellow-500/30"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <Download className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>
                
                {/* Third row - 4 images on desktop, 2 on mobile */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="relative group">
                    <Image
                      src="/samples/65fdf79a-6126-4fe1-ae08-bfc649fed31a.png"
                      alt="AI Generated Image 9"
                      width={250}
                      height={250}
                      className="aspect-square object-cover rounded-lg border border-red-500/30"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <Download className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="relative group">
                    <Image
                      src="/samples/68f566e1-3557-42af-8e06-1f67dbdf9a9a.png"
                      alt="AI Generated Image 10"
                      width={250}
                      height={250}
                      className="aspect-square object-cover rounded-lg border border-indigo-500/30"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <Download className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="relative group">
                    <Image
                      src="/samples/712331d9-93a0-432e-81d9-05f0f401dded.png"
                      alt="AI Generated Image 11"
                      width={250}
                      height={250}
                      className="aspect-square object-cover rounded-lg border border-teal-500/30"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <Download className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="relative group">
                    <Image
                      src="/samples/72a307fd-1d45-4dc0-9b51-7fbe5ad800e4.png"
                      alt="AI Generated Image 12"
                      width={250}
                      height={250}
                      className="aspect-square object-cover rounded-lg border border-violet-500/30"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <Download className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

          {/* Sample Videos Section */}
          <div className="glass border border-cyan-500/30 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center justify-center">
              <Video className="w-8 h-8 ml-3 text-cyan-400" />
              نمونه ویدیوهای تولید شده
            </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative group">
                  <video
                    className="aspect-video w-full rounded-lg border border-orange-500/30"
                    poster="/samples/290352883320399.mp4"
                    controls
                    preload="metadata"
                  >
                    <source src="/samples/290352883320399.mp4" type="video/mp4" />
                    مرورگر شما از پخش ویدیو پشتیبانی نمی‌کند.
                  </video>
                  <div className="absolute inset-0 bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
                    <Play className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="relative group">
                  <video
                    className="aspect-video w-full rounded-lg border border-purple-500/30"
                    poster="/samples/290353787538985.mp4"
                    controls
                    preload="metadata"
                  >
                    <source src="/samples/290353787538985.mp4" type="video/mp4" />
                    مرورگر شما از پخش ویدیو پشتیبانی نمی‌کند.
                  </video>
                  <div className="absolute inset-0 bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
                    <Play className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="relative group">
                  <video
                    className="aspect-video w-full rounded-lg border border-cyan-500/30"
                    poster="/samples/290354191328182.mp4"
                    controls
                    preload="metadata"
                  >
                    <source src="/samples/290354191328182.mp4" type="video/mp4" />
                    مرورگر شما از پخش ویدیو پشتیبانی نمی‌کند.
                  </video>
                  <div className="absolute inset-0 bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
                    <Play className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="relative group">
                  <video
                    className="aspect-video w-full rounded-lg border border-green-500/30"
                    poster="/samples/290354611320658.mp4"
                    controls
                    preload="metadata"
                  >
                    <source src="/samples/290354611320658.mp4" type="video/mp4" />
                    مرورگر شما از پخش ویدیو پشتیبانی نمی‌کند.
                  </video>
                  <div className="absolute inset-0 bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
                    <Play className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="relative group">
                  <video
                    className="aspect-video w-full rounded-lg border border-red-500/30"
                    poster="/samples/6ad1e4fe83e6cb0debbc9a760d6de3b5_1758728193_9n60ejn3.mp4"
                    controls
                    preload="metadata"
                  >
                    <source src="/samples/6ad1e4fe83e6cb0debbc9a760d6de3b5_1758728193_9n60ejn3.mp4" type="video/mp4" />
                    مرورگر شما از پخش ویدیو پشتیبانی نمی‌کند.
                  </video>
                  <div className="absolute inset-0 bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
                    <Play className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="relative group">
                  <video
                    className="aspect-video w-full rounded-lg border border-blue-500/30"
                    poster="/samples/8db9e8ec9a757222698d4cfa5098173a_1758727669.mp4"
                    controls
                    preload="metadata"
                  >
                    <source src="/samples/8db9e8ec9a757222698d4cfa5098173a_1758727669.mp4" type="video/mp4" />
                    مرورگر شما از پخش ویدیو پشتیبانی نمی‌کند.
                  </video>
                  <div className="absolute inset-0 bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
                    <Play className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            </div>

        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative z-10 py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="glass border border-cyan-500/30 rounded-3xl p-12">
            <h2 className="text-4xl md:text-5xl font-bold neon-text mb-6">
              آماده شروع هستید؟
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              همین حالا به دنیای هوش مصنوعی بپیوندید و از قابلیت‌های پیشرفته آن بهره‌مند شوید
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-4 px-16 py-6 text-2xl font-bold text-white rounded-2xl transition-all duration-300 shadow-2xl shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #00f5ff, #0066ff)',
                border: '2px solid transparent',
                backgroundImage: 'linear-gradient(135deg, #00f5ff, #0066ff) padding-box, linear-gradient(45deg, #00f5ff, #DAF527, #00ff88, #DAF527) border-box',
                animation: 'neon-border 24s ease-in-out infinite'
              }}
            >
              <Zap className="w-8 h-8" />
              <span>شروع کنید</span>
              <ArrowRight className="w-8 h-8" />
            </Link>
          </div>
        </div>
      </section>

        {/* Footer */}
      <footer className="relative z-10 py-8 px-4 border-t border-cyan-500/20 bg-[#2f3033]">
        <div className="max-w-6xl mx-auto text-center">
                 <p className="text-gray-400">
                   © 2024-2025 ویپانا. تمامی حقوق محفوظ است.
                 </p>
        </div>
        <div className="flex flex-wrap justify-center items-center gap-6 mx-auto mt-4">
          <a target="_blank" rel="noopener noreferrer" href="https://trustseal.enamad.ir/?id=559858&Code=b4gjrCaX5tzVF3YuBMH6PEFd4UDF5vIT">
            <img src="https://www.samanehha.com/images/upload/1643521765_%D8%A7%DB%8C%D9%86%D9%85%D8%A7%D8%AF.png" alt="اینماد" className="cursor-pointer" width={100} height={100} />
          </a>
          <a target="_blank" rel="noopener noreferrer" href="https://qr.mojavez.ir/track/I12986917">
            <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQzfUx8aGCq1oCsAPRY_I2y9V3irBJb8Ne-kg&s" alt="مجوز" className="cursor-pointer" width={100} height={100} />
          </a>
          <a target="_blank" rel="noopener noreferrer" href="https://gilan.irannsr.org/fa/real_persones/2696839/swd_id/106477/%D8%A7%D8%B9%D8%B6%D8%A7-%D9%85%D8%B4%D8%A7%D9%88%D8%B1%D8%A7%D9%86-%D8%AD%D9%82%DB%8C%D9%82%DB%8C.html">
            <img src="https://www.samanehha.com/images/upload/1658203504_%D8%B3%D8%A7%D8%B2%D9%85%D8%A7%D9%86%20%D9%86%D8%B8%D8%A7%D9%85%20%D8%B5%D9%86%D9%81%DB%8C%20%D8%B1%D8%A7%DB%8C%D8%A7%D9%86%D9%87%20%D8%A7%DB%8C.png" alt="سازمان نظام صنفی" className="cursor-pointer" width={100} height={100} />
          </a>
          <a target="_blank" rel="noopener noreferrer" href="https://www.zarinpal.com/trustPage/vipana.ir">
            <img src="https://parspng.com/wp-content/uploads/2023/01/zarin-palpng.parspng.com_.png" alt="زرین‌پال" className="cursor-pointer" width={100} height={100} />
          </a>
        </div>
      </footer>
    </div>
  );
}
