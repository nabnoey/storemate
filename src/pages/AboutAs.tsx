import champoo from "../assets/champoo.jpg";
import drink from "../assets/drink_mango.jpg";
import soap from "../assets/soap_padthong.webp";
import padthong from "../assets/padthong.jpg";
import padthongLogo from "../assets/navbar_padthong.jpg";

const AboutUs = () => {
  return (
    <main className="w-full min-h-screen bg-white flex flex-col font-anuphan">
      <section className="w-full bg-[#fbf9f4] pt-9 pb-10 md:pt-20 md:pb-21 overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="flex flex-col justify-center text-left px-4 md:px-0">
              <h1
                className="font-['Anuphan'] font-semibold text-[20px] text-[#0F0202] leading-[32px] break-words max-w-[320px] mb-4
             sm:max-w-none sm:text-5xl sm:leading-[1.2] lg:text-[62px] lg:font-bold lg:text-[#1f1a17] lg:leading-[1.15] lg:tracking-tight lg:mb-6"
              >
                สืบสานภูมิปัญญาไทย
                <span className="inline-block ml-1 sm:ml-4 lg:-ml-1">
                  สู่พลังแห่ง
                </span>
                <br className="hidden sm:inline" />
                ความยั่งยืนในทุกวัน
              </h1>
              <p
                className="font-['Anuphan'] font-normal text-[14px] text-[#2C2C2C] leading-[24px] break-words text-left max-w-xl
                sm:text-base lg:text-lg lg:text-gray-600 lg:leading-relaxed lg:mx-0"
              >
                "เราคือผู้บุกเบิกนวัตกรรมสมุนไพรไทย
                ที่มุ่งเน้นการคัดสรรคุณค่าจากธรรมชาติ โดยเฉพาะ
                'มะม่วงหาวมะนาวโห่' เพื่อส่งมอบสุขภาพที่ดีและยั่งยืน
                ให้กับไลฟ์สไตล์ที่ทันสมัยของคุณ"
              </p>
            </div>

            <div className="w-full">
              <div className="hidden md:flex grid grid-cols-12 gap-6 lg:gap-10">
                <div className="col-span-5 md:col-span-4 flex flex-col justify-between gap-6 lg:gap-10">
                  <div className="w-full rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-transform duration-500 hover:scale-105 bg-white aspect-square">
                    <img
                      src={champoo}
                      alt="ผลิตภัณฑ์สมุนไพร แชมพู"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="w-full rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-transform duration-500 hover:scale-105 bg-white aspect-square">
                    <img
                      src={soap}
                      alt="ผลิตภัณฑ์สมุนไพร สบู่"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                <div className="col-span-7 md:col-span-8 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-transform duration-500 hover:scale-105 bg-white flex items-center justify-center">
                  <img
                    src={drink}
                    alt="น้ำมะม่วงหาวมะนาวโห่ ตรา พัดทอง"
                    className="w-full h-auto object-contain"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full bg-white py-12 md:py-20">
        <div className="w-full max-w-7xl mx-auto px-0 sm:px-6 md:px-8">
          <div className="hidden md:block mb-8 md:mb-12 text-sm text-gray-500 px-4 sm:px-0">
            <a
              href="/"
              className="cursor-pointer hover:text-blue-500 transition-colors"
            >
              หน้าหลัก
            </a>
            <span className="mx-2">&gt;</span>
            <span className="text-gray-900 font-medium">เกี่ยวกับเรา</span>
          </div>

          <h2 className="font-['Anuphan'] font-semibold text-[16px] text-[#0F0202] leading-[24px] text-center w-full mb-6 block md:hidden ml-10">
            ก้าวใหม่สู่ความยั่งยืน
            <br />
            พลังจากสมุนไพรไทย
          </h2>

          <div
            className="w-full flex flex-row items-start justify-start gap-3 
                    md:grid md:grid-cols-2 md:gap-16 lg:gap-24 md:items-center"
          >
            <div
              className="w-[120px] h-[120px] flex-shrink-0 flex items-center justify-center pl-1
                      md:w-full md:h-auto md:max-w-[400px] lg:max-w-[500px] md:bg-[#fdfdfd] md:aspect-square md:p-8 md:rounded-2xl md:shadow-[0_4px_40px_rgba(0,0,0,0.04)] md:pl-0"
            >
              <img
                src={padthong}
                alt="ตรา พัดทอง"
                className="w-full h-auto object-contain hover:scale-105 transition-transform duration-500"
              />
            </div>

            <div className="flex-1 w-full flex flex-col items-start text-left pr-3 md:pr-0 md:justify-center">
              {/* หัวข้อบน Desktop */}
              <h2 className="hidden md:block font-['Anuphan'] font-bold text-3xl sm:text-4xl lg:text-5xl text-[#1f1a17] leading-tight mb-6 tracking-tight">
                ก้าวใหม่สู่ความยั่งยืน
                <br />
                พลังจากสมุนไพรไทย
              </h2>
              <div
                className="w-full font-['Anuphan'] font-normal text-[12px] text-black leading-[20px] tracking-wide break-keep text-left
                        md:text-gray-600 md:text-sm sm:md:text-base lg:md:text-lg md:leading-relaxed md:space-y-4"
              >
                <p>
                  เราเชื่อว่า "สุขภาพที่ดีคือพื้นฐานของชีวิตที่ทันสมัย"
                  เราจึงนำสมุนไพรไทยที่มีสรรพคุณสูงอย่างมะม่วงหาวมะนาวโห่
                  มาผ่านกระบวนการคัดสรรและแปรรูปด้วยนวัตกรรมใหม่
                  เพื่อเปลี่ยนภาพจำของสมุนไพรแบบเดิมให้กลายเป็นผลิตภัณฑ์ที่ใช้งานง่าย
                  มีรสชาติที่ดี และเข้ากับไลฟ์สไตล์ที่เร่งรีบในปัจจุบัน
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Store History (ประวัติร้านค้า)      */}
      <section className="w-full bg-[#1B3022] text-white py-12 sm:py-16 lg:py-24 overflow-hidden">
        <div className="max-w-[1600px] mx-auto px-0 sm:px-8 md:px-12 lg:pl-16 lg:pr-6">
          <div
            className="flex flex-col items-center p-[12px] sm:p-6 gap-4 w-full
                    lg:grid lg:grid-cols-12 lg:gap-16 lg:items-center lg:p-0"
          >
            <h2 className="font-['Anuphan'] font-semibold text-[20px] sm:text-3xl sm:leading-[42px] text-white leading-[32px] text-center w-full block lg:hidden mb-2">
              ประวัติร้านค้า
            </h2>

            <div className="w-[195px] h-[106px] sm:w-[380px] sm:h-[200px] flex items-center justify-center overflow-hidden rounded-xl block lg:hidden shadow-lg mb-4">
              <img
                src={padthongLogo}
                alt="ตรา พัดทอง Mobile/Tablet"
                className="w-full h-full object-cover"
              />
            </div>

            <div
              className="w-full flex flex-col justify-start items-start gap-[16px] sm:gap-[20px]
                      lg:w-auto lg:col-span-5 lg:space-y-6 lg:gap-0"
            >
              <h2 className="hidden lg:block text-3xl lg:text-[64px] font-bold tracking-wide">
                ประวัติร้านค้า
              </h2>

              <p
                className="font-['Anuphan'] font-normal text-[12px] text-white leading-[20px] break-words text-left
                      sm:text-[15px] sm:leading-[26px] lg:text-base lg:text-gray-300 lg:leading-relaxed lg:font-light"
              >
                จุดเริ่มต้นของเราไม่ได้มาจากห้องแล็บ
                แต่มาจากสวนหลังบ้านที่มีต้นไม้หนามคมกริบแต่เต็มไปด้วยผลไม้สีชมพูระเรื่อ
                ในยุคที่ทุกคนมองหา Superfood จากต่างประเทศ
                เรากลับหลงใหลในความเปรี้ยวจัดจ้านและความทรงพลังของ
                "มะม่วงหาวมะนาวโห่" สมุนไพรไทยที่ถูกลืม
                เราจึงหยิบเอาภูมิปัญญาเดิมมาปัดฝุ่นใหม่
                ให้กลายเป็นผลิตภัณฑ์ที่ตอบโจทย์ไลฟ์สไตล์คนเมืองที่โหยหาความละเมียดละไม
              </p>

              <div
                className="w-full font-['Anuphan'] font-normal text-[12px] text-white leading-[20px] break-words text-left
                        sm:text-[15px] sm:leading-[26px] lg:text-base lg:text-gray-300 lg:leading-relaxed lg:font-light"
              >
                {/* mobile and tablet */}
                <div className="block lg:hidden">
                  <span className="block font-medium text-[14px] sm:text-[18px] mb-1 text-white">
                    ปรัชญาของเรา (Our Philosophy)
                  </span>
                  <span className="block mb-3 text-gray-200">
                    เราเชื่อในความ "คราฟต์" (Craft) และความจริงใจต่อวัตถุดิบ:
                  </span>
                  <span className="block text-gray-300 pl-1 space-y-2 sm:space-y-3 leading-[22px] sm:leading-[28px]">
                    •
                    <strong className="text-white font-medium">
                      Small Batch:
                    </strong>
                    เราผลิตในปริมาณน้อย
                    เพื่อควบคุมคุณภาพให้สดใหม่เหมือนทำกินเองในครอบครัว
                    <br />•
                    <strong className="text-white font-medium">
                      Artisanal Process:
                    </strong>
                    คัดสรรผลสดด้วยมือ (Hand-picked)
                    เลือกเฉพาะผลที่สุกงอมได้ที่เพื่อให้ได้สารแอนโทไซยานิน
                    (Anthocyanin) สูงสุด
                    <br />•
                    <strong className="text-white font-medium">
                      Ethical & Clean:
                    </strong>
                    ไม่ใช้สารกันเสีย ไม่แต่งสีสังเคราะห์
                    ความแดงก่ำที่คุณเห็นคือสีสันจากธรรมชาติ 100%
                  </span>
                </div>
                {/* desktop */}
                <div className="hidden lg:block">
                  <h3 className="font-semibold text-white mb-2 text-base lg:text-lg lg:mt-4">
                    ปรัชญาของเรา (Our Philosophy)
                  </h3>
                  <p className="mb-2">
                    เรายึดมั่นในงาน "คราฟท์" (Craft) และความใส่ใจต่อวัตถุดิบ:
                  </p>
                  <ul className="list-disc pl-5 space-y-2 text-gray-400">
                    <li>
                      <strong className="text-gray-300">Small Batch:</strong>{" "}
                      Production น้อย คุมคุณภาพสดใหม่
                    </li>
                    <li>
                      <strong className="text-gray-300">
                        Artisanal Process:
                      </strong>
                      คัดสรรผลสดด้วยมือ (Hand-picked) เพื่อสารแอนโทไซยานินสูงสุด
                    </li>
                    <li>
                      <strong className="text-gray-300">
                        Ethical & Clean:
                      </strong>
                      ไม่ใส่สารกันบูด ไม่แต่งกลิ่นสังเคราะห์ ธรรมชาติ 100%
                    </li>
                  </ul>
                </div>
              </div>

              <div
                className="w-full font-['Anuphan'] font-normal text-[12px] text-white leading-[20px] break-words text-left
                        sm:text-[15px] sm:leading-[26px] lg:text-sm lg:text-base lg:text-gray-300 lg:leading-relaxed lg:font-light lg:pt-4"
              >
                <h3 className="font-medium text-white text-[14px] sm:text-[18px] lg:font-semibold lg:mb-2 lg:text-lg">
                  สิ่งที่คุณจะได้สัมผัส
                </h3>
                <p className="mt-1 sm:mt-2">
                  ไม่ใช่แค่น้อยขายสมุนไพร แต่คือ Experience
                  ของการลิ้มรสความเปรี้ยวที่มาพร้อมกับความใส่ใจ
                  ตั้งแตกระบวนการปลูกแบบอินทรีย์
                  ไปจนถึงบรรจุภัณฑ์ที่เป็นมิตรต่อสิ่งแวดล้อม (Eco-friendly
                  packaging)
                </p>
              </div>
            </div>

            <div className="hidden lg:block lg:col-span-7 w-full relative">
              <div className="relative w-full rounded-xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)]">
                <img
                  src={padthongLogo}
                  alt="สมุนไพรมะม่วงหาว มะนาวโห่ ตรา พัดทอง Desktop"
                  className="w-full h-auto object-cover transition-transform duration-700 hover:scale-105"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Highlight Features (จุดเด่น) */}
      <section className="w-full flex flex-col bg-[#faf9f6] m-0 p-0 border-none">
        {/* กล่องข้อความสีดำ */}
        <div className="w-full bg-white py-12 md:py-20">
          <div className="w-full flex justify-end">
            <div
              className="w-full max-w-[531px] min-h-[128px] bg-[#1B3022] rounded-[16px] pt-[12px] pb-[12px] px-[16px] gap-[16px] flex items-center shadow-2xl ml-auto -mr-4
             md:w-[90%] md:max-w-[940px] md:min-h-[274px] md:rounded-r-none md:rounded-l-[30px] md:py-10 md:px-16 md:gap-0 md:mr-0 md:ml-auto"
            >
              <div className="w-full flex flex-col items-center justify-start gap-4 md:gap-3 md:items-start md:text-left relative min-h-[140px] md:min-h-0">
                <div className="w-full flex flex-col items-center gap-4 block md:hidden">
                  <h2 className="font-['Anuphan'] font-normal text-[14px] text-white leading-[24px] text-left w-full break-words">
                    ปลุกความสดชื่น เติมพลังสีแดง... ด้วยพลังธรรมชาติ 100%
                  </h2>

                  <div className="self-end flex flex-col items-start justify-start text-left text-white font-['Anuphan'] font-normal text-[12px] leading-[20px] gap-0.5 mt-2">
                    <p>จากภูมิปัญญาหลังบ้าน</p>
                    <p>สู่ผลิตภัณฑ์คุณภาพ...</p>
                    <p>ปัดฝุ่นสมุนไพรไทยให้กลับมา</p>
                  </div>
                </div>

                <div className="hidden md:flex md:flex-col md:items-start md:text-left md:w-full md:gap-3">
                  <h2 className="text-2xl sm:text-3xl md:text-[48px] lg:text-[2.75rem] font-bold text-white leading-[1.1] tracking-wide">
                    ปลุกความสดชื่น เติมพลังสีแดง...
                  </h2>

                  <h2 className="text-2xl sm:text-3xl md:text-[48px] lg:text-[2.75rem] font-bold text-white leading-[1.1] tracking-wide pl-12 md:pl-20">
                    ด้วยพลังธรรมชาติ 100%
                  </h2>

                  <p className="text-xs sm:text-[20px] md:text-base text-gray-300 font-bold max-w-2xl self-end text-right pt-4 md:pt-9">
                    จากภูมิปัญญาหลังบ้าน
                    สู่ผลิตภัณฑ์คุณภาพ...ปัดฝุ่นสมุนไพรไทยให้กลับมา
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* พื้นหลังสีครีม */}
        <div className="w-full bg-[#FBF7F1] md:bg-[#faf9f6] m-0 border-none font-anuphan">
          <div className="max-w-[1440px] mx-auto min-h-[240px] px-4 py-1.5 md:px-[60px] md:py-[16px] flex flex-col justify-center">
            <div className="flex flex-col md:flex-row justify-between items-stretch gap-3 md:gap-0">
              <div className="flex-1 px-[30px] py-0 md:py-0 md:pl-0 md:pr-10 lg:pr-16 md:border-r border-black flex flex-col justify-start gap-[15px] md:gap-4">
                <h3 className="tracking-tight font-semibold text-[#0F0202] md:text-[#1f1a17] text-base md:text-2xl lg:text-3xl leading-6 md:leading-[1.2] font-anuphan">
                  ใส่ใจคุณภาพ <br className="hidden md:inline" />{" "}
                  เพื่อสุขภาพที่ยั่งยืนของคุณ
                </h3>
                <p className="text-xs md:text-sm lg:text-base text-[#0F0202] md:text-black font-normal md:font-semibold max-w-[300px] font-sans">
                  ดูมาตรฐานการคัดสรรวัตถุดิบ
                </p>
              </div>

              <div className="w-full h-0 border-t border-black opacity-100 md:hidden" />

              <div className="flex-1 px-[30px] py-0 md:py-0 md:px-10 lg:px-16 md:border-r border-black flex flex-col justify-start gap-[15px] md:gap-4">
                <h3 className="tracking-tight font-semibold text-[#0F0202] md:text-[#1f1a17] text-base md:text-2xl lg:text-3xl leading-6 md:leading-[1.2] font-anuphan">
                  พลิกโฉมสมุนไพรไทย <br className="hidden md:inline" />{" "}
                  ด้วยกระบวนการที่ทันสมัย
                </h3>
                <p className="text-xs md:text-sm lg:text-base text-[#0F0202] md:text-black font-normal md:font-semibold max-w-[300px] font-sans">
                  ดูมาตรฐานการคัดสรรวัตถุดิบ
                </p>
              </div>

              <div className="w-full h-0 border-t border-black opacity-100 md:hidden" />

              <div className="flex-1 px-[30px] py-0 md:py-0 md:pl-10 lg:pl-16 flex flex-col justify-start gap-[15px] md:gap-4">
                <h3 className="tracking-tight font-semibold text-[#0F0202] md:text-[#1f1a17] text-base md:text-2xl lg:text-3xl leading-6 md:leading-[1.2] font-anuphan">
                  ออกแบบมาเพื่อไลฟ์สไตล์ <br className="hidden md:inline" />{" "}
                  และการใช้งานที่ลงตัว
                </h3>
                <p className="text-xs md:text-sm lg:text-base text-[#0F0202] md:text-black font-normal md:font-semibold max-w-[300px] font-sans">
                  ดูมาตรฐานการคัดสรรวัตถุดิบ
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default AboutUs;
