import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const Faq = () => {
  const [openIndex, setOpenIndex] = useState(0);

  const faqData = [
    {
      question: "What is Protein Lab?",
      answer: "Protein Lab is a platform dedicated to helping you achieve your fitness and nutrition goals through tailored workout plans, diet suggestions, and a supplement store."
    },
    {
      question: "How do I get started?",
      answer: "Simply sign up, provide your details, and choose your fitness or nutrition plan. Our system will generate a personalized program for you."
    },
    {
      question: "Can I purchase supplements directly through the website?",
      answer: "Yes! Our supplement store offers a variety of products, with a convenient cash-on-delivery option."
    },
    {
      question: "What is the Victory Wall?",
      answer: "The Victory Wall is where our members share their success stories to inspire and motivate others."
    },
    {
      question: "Is there a fee for using the platform?",
      answer: "Basic features are free. For advanced plans and premium content, subscription options are available."
    },
    {
      question: "How do I suggest a new feature or improvement?",
      answer: "Use our suggestion forum to share your ideas. Our admin team reviews all submissions regularly."
    },
    {
      question: "What types of workout plans are available?",
      answer: "We offer a variety of plans focusing on strength, endurance, weight loss, and more, customized to your needs."
    },
    {
      question: "Can I modify my plans later?",
      answer: "Absolutely! You can update your preferences anytime, and we'll adjust your plans accordingly."
    }
  ];

  const toggleQuestion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="w-full px-4 py-12">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-12 text-4xl font-bold text-center md:text-5xl">
          FAQ
        </h1>

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
                className="flex items-center justify-between w-full p-3 text-left transition-colors duration-200 bg-dark hover:bg-secondary"
              >
                <span>
                  {item.question}
                </span>
                {openIndex === index ? (
                  <ChevronUp className="w-8 h-8" strokeWidth={1.5} />
                ) : (
                  <ChevronDown className="w-8 h-8" strokeWidth={1.5} />
                )}
              </button>

              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openIndex === index ? 'max-h-96' : 'max-h-0'
                }`}
              >
                <div className="p-3 bg-dark">
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