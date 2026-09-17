import { Icon } from "@iconify/react";

type ContactCardProps = {
  icon: string;
  color: string;
  children: React.ReactNode;
};

function ContactCard({ icon, color, children }: Readonly<ContactCardProps>) {
  return (
    <div className="border rounded-xl p-5 md:p-6 text-center shadow-sm hover:shadow-md transition cursor-pointer">
      <Icon
        icon={icon}
        className={`text-3xl md:text-4xl mx-auto mb-3 ${color}`}
      />
      <p className="text-black font-medium text-sm md:text-base">{children}</p>
    </div>
  );
}

function Contact() {
  return (
    <div className="w-full">
      <div className="bg-[#FBF7F1] py-10 md:py-12 lg:pt-20 text-center">
        <h1 className="font-bold text-black text-3xl  sm:text-4xl md:text-5xl lg:text-[64px] font-Anuphan">
          ข้อมูลการติดต่อ
        </h1>

        <p className="text-black mt-3 md:mt-4 text-base md:text-lg font-Anuphan font-semibold">
          พร้อมให้บริการและตอบคำถามทุกช่องทางเสมอของคุณ
        </p>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-12 md:py-16">
        <div className="mb-6 md:mb-12 text-sm text-gray-500">
          <a
            href="/"
            className="cursor-pointer hover:text-blue-500 transition-colors"
          >
            หน้าหลัก
          </a>
          <span className="mx-2">&gt;</span>
          <span className="text-gray-900 font-medium">ติดต่อ</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 md:gap-6">
          <ContactCard icon="mdi:email" color="text-blue-500">
            padthongofficial@gmail.com
          </ContactCard>

          <ContactCard icon="mdi:map-marker" color="text-red-500">
            199 ถ.ดอนตะโก ต.ดอนตะโก <br />
            อ.เมือง จ.ราชบุรี 70120
          </ContactCard>

          <ContactCard icon="mdi:phone" color="text-green-500">
            0983309919
          </ContactCard>
        </div>

        <h2 className="text-center mt-12 md:mt-16 mb-6 md:mb-8 text-3xl md:text-4xl lg:text-[48px] text-black font-Anuphan font-semibold">
          โซเชียลมีเดีย
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-6 max-w-[600px] mx-auto">
          <ContactCard icon="fa6-brands:line" color="text-green-500">
            @Pattong
          </ContactCard>

          <a
            href="https://www.facebook.com/Padthong636"
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <ContactCard icon="mdi:facebook" color="text-blue-600">
              มะม่วงหาว มะนาวโห่ ตราพัดทอง
            </ContactCard>
          </a>
        </div>
      </div>
    </div>
  );
}

export default Contact;
