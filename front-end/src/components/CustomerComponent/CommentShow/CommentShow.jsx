import { useEffect, useState } from "react";
import {
  getAmountOfReview,
  getReviewByProductId,
} from "../../../service/CustomerService/reviewService";
import Rating from "react-rating";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import { API_BASE_URL } from "../../../config/config";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import { formatDate } from "../../../utils/formatDate";
import { getUserInfo } from "../../../service/CustomerService/userService";
import { useToast } from "../../../context/ToastContext";
import Loading from "../../Loading.jsx"; // Import the Loading component

export default function CommentShow() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [comments, setComments] = useState([]);
  const [amountOfReview, setAmountOfReview] = useState(0);
  const [newComment, setNewComment] = useState("");
  const [newRating, setNewRating] = useState(0);
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(true); // Add loading state
  const [userInfo, setUserInfo] = useState({}); // Initialize userInfo state

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      const decodedToken = jwtDecode(token);
      setUserId(decodedToken.userid);
    }

    const fetchData = async () => {
      setLoading(true); // Set loading to true before API calls
      try {
        const [reviewsResponse, reviewCountResponse] = await Promise.all([
          getReviewByProductId(id),
          getAmountOfReview(id),
        ]);

        setComments(reviewsResponse.data);
        setAmountOfReview(reviewCountResponse.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false); // Set loading to false after API calls
      }
    };

    fetchData();
  }, [id]);

  // Fetch user info when comments change
  useEffect(() => {
    const fetchUserInfo = async () => {
      const userInfoMap = {};
      for (const comment of comments) {
        const data = await getUserInfo(comment.userid);
        userInfoMap[comment.userid] = data;
      }
      setUserInfo(userInfoMap);
    };

    if (comments.length > 0) {
      fetchUserInfo();
    }
  }, [comments]);

  const { setToastMessage } = useToast();
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!userId) {
        setToastMessage("Vui lòng đăng nhập để đánh giá sản phẩm");
        navigate("/login");
      }
      if (newRating === 0) {
        toast.error("Vui lòng chọn số sao trước khi gửi đánh giá");
        return;
      }
      if (newComment === "") {
        toast.error("Vui lòng nhập bình luận trước khi gửi đánh giá");
        return;
      }

      const response = await axios.post(`${API_BASE_URL}/review`, {
        userId: userId,
        productId: id,
        rating: newRating,
        comment: newComment,
      });
      setNewComment("");
      setNewRating(0);
      const [reviewsResponse, reviewCountResponse] = await Promise.all([
        getReviewByProductId(id),
        getAmountOfReview(id),
      ]);
      setComments(reviewsResponse.data);
      setAmountOfReview(reviewCountResponse.data);
      toast.success(response.data.message);
    } catch (error) {
      console.error("Error posting review:", error);
    }
  };

  return (
    <div>
      {loading ? (
        <Loading />
      ) : (
        <>
          <div className="flex bg-fourth p-5 rounded-lg shadow-2xl">
            <div className="w-1/3 flex my-2 ">
              <div className="flex m-auto">
                <p className="text-6xl font-bold m-auto mr-1">
                  {amountOfReview[6]}
                </p>
                <FontAwesomeIcon icon={faStar} color="#ffd700" size="4x" />
              </div>
              <div className="h-full bg-black w-0 p-0.5 m-2"></div>
              <div className="m-2 font-bold">
                {[5, 4, 3, 2, 1].map((rating) => (
                  <div className="flex m-1" key={rating}>
                    <Rating
                      initialRating={rating}
                      readonly
                      emptySymbol={
                        <FontAwesomeIcon icon={faStar} color="#ccc" size="2x" />
                      }
                      fullSymbol={
                        <FontAwesomeIcon
                          icon={faStar}
                          color="#ffd700"
                          size="2x"
                        />
                      }
                    />
                    <p className="text-lg ml-2 my-auto">
                      {amountOfReview[rating - 1]}{" "}
                      <span className="font-light ml-1">đánh giá</span>
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="w-2/3 flex">
              <div className="h-full bg-black w-0 p-0.5 m-2"></div>
              <div className="flex flex-col w-11/12 m-auto">
                <form onSubmit={handleSubmit}>
                  <div className="flex mb-3">
                    <p className="text-2xl font-bold mx-3 text-primary">
                      Đánh giá của bạn:
                    </p>

                    <Rating
                      initialRating={newRating}
                      emptySymbol={
                        <FontAwesomeIcon icon={faStar} color="#ccc" size="2x" />
                      }
                      fullSymbol={
                        <FontAwesomeIcon
                          icon={faStar}
                          color="#ffd700"
                          size="2x"
                        />
                      }
                      onChange={(value) => setNewRating(value)}
                    />
                  </div>
                  <input
                    type="text"
                    className="w-full border-2 border-slate-950 rounded-lg p-3 m-3"
                    placeholder="Nhập bình luận"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                  />
                  <div className="flex justify-end">
                    <button className=" w-1/6 bg-primary text-white font-bold rounded-lg px-3 py-2">
                      Gửi
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          <div className="mt-5 flex bg-fourth p-3 rounded-lg flex-col shadow-2xl">
            {comments.length > 0 ? (
              comments.map((comment) => (
                <div
                  key={comment.reviewid} // Ensure the key is unique
                  className="w-full my-1 bg-white p-1 rounded-lg shadow-2xl"
                >
                  <div className="flex my-auto">
                    <img
                      src={userInfo[comment.userid]?.avatar || ""}
                      alt="avatar"
                      className="mx-3 my-auto w-8 h-8 rounded-full"
                    />
                    <p className="font-bold text-xl my-auto">
                      {userInfo[comment.userid]?.fullname || "Ẩn danh"}
                    </p>

                    <p className="font-light my-auto mx-3">
                      {formatDate(comment.reviewtime)}
                    </p>
                  </div>
                  <div className="flex my-auto">
                    <Rating
                      initialRating={comment.rating}
                      readonly
                      emptySymbol={
                        <FontAwesomeIcon icon={faStar} color="#ccc" size="2x" />
                      }
                      fullSymbol={
                        <FontAwesomeIcon
                          icon={faStar}
                          color="#ffd700"
                          size="2x"
                        />
                      }
                      className="ml-5 my-2"
                    />
                    <p className="text-lg ml-5 my-auto font-semibold">
                      {comment.comment}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="font-bold text-primary">Chưa có đánh giá nào...</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
