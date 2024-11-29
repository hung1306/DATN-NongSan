import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import slider1 from "../../../assets/slider/slider1.jpg";
import slider2 from "../../../assets/slider/slider2.jpg";
import slider3 from "../../../assets/slider/slider3.jpg";

const imgs = [slider1, slider2, slider3];

const SlideShow = () => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
  };

  return (
    <>
      <style>
        {`
          .slick-next:before, .slick-prev:before {
            font-size: 30px;
            color: #07bc0c;
          }

          .slick-next, .slick-prev {
            height: 50px;
            width: 50px;
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            border-radius: 50%;
            z-index: 1;
          }

          .slick-next {
            right: 10px;
          }

          .slick-prev {
            left: 10px;
          }

          .slick-dots li button:before {
            color: #07bc0c;
            font-size: 16px;
          }

          .slick-dots li.slick-active button:before {
            color: #fc3;
          }

          .slick-slide {
            opacity: 0;
            transition: opacity 1.5s ease-in-out;
          }

          .slick-active {
            opacity: 1;
          }

          .slide-text {
            position: absolute;
            bottom: 15%;
            left: 5%;
            color: white;
            font-size: 2rem;
            background-color: rgba(0, 0, 0, 0.5);
            padding: 10px 20px;
            border-radius: 10px;
            animation: fadeIn 1.5s ease-in-out;
          }

          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }
        `}
      </style>
      <Slider {...settings} className="w-1/2 h-96 bg-fourth shadow-2xl">
        {imgs.map((image, index) => (
          <div key={index} className="h-96  rounded-lg">
            <img src={image} alt={`Slide ${index}`} className="w-full h-full" />
          </div>
        ))}
      </Slider>
    </>
  );
};

export default SlideShow;
