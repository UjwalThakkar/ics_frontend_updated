import Footer from "@/components/Footer";
import Header from "@/components/Header";
import VisaInfo from "@/components/VisaInfo";
import WhatsAppWidget from "@/components/WhatsAppWidget";

const visaForm = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6"></div>
        <VisaInfo />
      </div>
      <Footer />
      <WhatsAppWidget />
    </div>
  );
};

export default visaForm;
