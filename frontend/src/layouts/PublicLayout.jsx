import BackgroundScene from "../components/common/BackgroundScene";
import Footer from "../components/common/Footer";
import Navbar from "../components/common/Navbar";
import PageTransition from "../components/common/PageTransition";

const PublicLayout = ({ children, compact = false }) => {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--bg)] text-white">
      <BackgroundScene density={compact ? "low" : "high"} />
      <div className="relative z-10">
        <Navbar compact={compact} />
        <main className={compact ? "pb-16 pt-4" : "pb-20 pt-6"}>
          <PageTransition>{children}</PageTransition>
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default PublicLayout;
