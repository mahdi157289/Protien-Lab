import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import SectionDivider from '../common/SectionDivider';

const Faq = () => {
  const [openIndex, setOpenIndex] = useState(0);
  const { t } = useTranslation();

  const faqData = [
    {
      question: t("faq_q1"),
      answer: t("faq_a1")
    },
    {
      question: t("faq_q2"),
      answer: t("faq_a2")
    },
    {
      question: t("faq_q3"),
      answer: t("faq_a3")
    },
    {
      question: t("faq_q4"),
      answer: t("faq_a4")
    },
    {
      question: t("faq_q5"),
      answer: t("faq_a5")
    },
    {
      question: t("faq_q6"),
      answer: t("faq_a6")
    },
    {
      question: t("faq_q7"),
      answer: t("faq_a7")
    },
    {
      question: t("faq_q8"),
      answer: t("faq_a8")
    }
  ];

  const toggleQuestion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="w-full px-4 py-12">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-4 text-4xl font-bold text-center md:text-5xl">
          FAQ
        </h1>
        <SectionDivider />

        <div className="space-y-2">
          {faqData.map((item, index) => (
            <div
              key={index}
              className={`overflow-hidden border rounded-lg transition-colors duration-200 ${
                openIndex === index ? 'border-white' : 'border-primary'
              }`}
            >
              <button
                onClick={() => toggleQuestion(index)}
                className="flex items-center justify-between w-full p-3 text-left transition-colors duration-200 bg-dark hover:bg-secondary text-white"
              >
                <span className="text-white font-source-sans">
                  {item.question}
                </span>
                {openIndex === index ? (
                  <ChevronUp className="w-8 h-8 text-white" strokeWidth={1.5} />
                ) : (
                  <ChevronDown className="w-8 h-8 text-white" strokeWidth={1.5} />
                )}
              </button>

              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openIndex === index ? 'max-h-96' : 'max-h-0'
                }`}
              >
                <div className="p-3 bg-dark text-white font-source-sans">
                  {item.answer}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Faq;