$(document).ready(function () {
  // 取得今天的日期
  let today = new Date();

  // 格式化日期為 YYYY-MM-DD
  function formatDate(date) {
    let yyyy = date.getFullYear();
    let mm = String(date.getMonth() + 1).padStart(2, "0"); // 月份補零
    let dd = String(date.getDate()).padStart(2, "0"); // 日期補零
    return `${yyyy}-${mm}-${dd}`;
  }

  // 計算今天與明天的日期
  let fromDate = formatDate(today);
  let tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1); // 加一天
  let toDate = formatDate(tomorrow);

  // 設定 API URL
  const API_URL = `https://api.showtimes.com.tw/1/events/listForCorporation/53?from=${fromDate}&to=${toDate}`;

  console.log("✅ 自動生成的 API URL:", API_URL);

  // 使用 axios 取代 fetch
  axios.get(API_URL)
    .then((response) => {
      // axios 會自動解析 JSON，所以直接使用 response.data
      const data = response.data;
      console.log("✅ 成功獲取即時 API 資料:", data);

      const programs = data.payload.programs;
      const events = data.payload.events;
      const venues = data.payload.venues;

      // 添加截斷文字的輔助函數
      function truncateText(text, limit) {
        if (text.length <= limit) return text;
        return text.slice(0, limit) + "...";
      }

      programs.forEach((program) => {
        if (program.name === "夜校女生") return;

        let movieEvents = events.filter(
          (event) => event.programId === program.id
        );
        if (movieEvents.length === 0) return;

        let title = program.name;
        let englishTitle = program.nameAlternative || "";
        let description = truncateText(program.description, 100); // 限制為 100 字
        let genres = program.genres.join(", ");
        let duration = `${Math.floor(program.duration / 60)}小時${
          program.duration % 60
        }分`;
        let poster = program.coverImagePortrait
          ? program.coverImagePortrait.url
          : "default-poster.jpg";
        let trailer = program.previewVideo ? program.previewVideo.url : "#";

        let showtimesByVenue = {};
        movieEvents.forEach((event) => {
          let venue = venues.find((v) => v.id === event.venueId);
          if (!venue) return;

          let venueName = `${venue.room} - ${event.meta.format}`;
          let eventTime = new Date(event.startedAt);
          let showtime = eventTime.toLocaleTimeString("zh-TW", {
            hour: "2-digit",
            minute: "2-digit",
            hourCycle: "h23", // 24 小時制
          });

          if (event.isEarlyBird) {
            showtime += " (早優)";
          }

          if (!showtimesByVenue[venueName]) {
            showtimesByVenue[venueName] = [];
          }
          showtimesByVenue[venueName].push(showtime);
        });

        let showtimeHtml = Object.keys(showtimesByVenue)
          .map((venueName) => {
            let times = showtimesByVenue[venueName]
              .sort()
              .map((time) => `<span class="showtime">${time}</span>`)
              .join("");
            return `
                          <div class="movie-card__showtimes">
                              <h4 class="showtimes-title">${venueName}</h4>
                              <div class="showtimes-list">${times}</div>
                          </div>
                      `;
          })
          .join("");
        let minHeight = Math.max(
          600,
          Object.keys(showtimesByVenue).length * 150
        );
        let movieCard = `
                  <div class="movie-card" style="background-image: url(${poster});      min-height: ${minHeight}px;">
                      <div class="movie-card__overlay"></div>
                      <div class="movie-card__content">
                          <div class="movie-card__header">
                              <h1 class="movie-card__title">${title}<br>${englishTitle}</h1>
                              <h4 class="movie-card__info">(${duration}) ${genres}</h4>
                          </div>
                          <p class="movie-card__desc">${description}</p>
                          ${showtimeHtml}
                          <a href="${trailer}" target="_blank" class="btn btn-outline movie-card__button">Watch Trailer</a>
                      </div>
                  </div>
              `;

        console.log("✅ 新增電影:", title);
        $("#dynamic-movie-list").append(movieCard);
      });
    })
    .catch((error) => {
      console.error("❌ 無法獲取 API 資料:", error);
      // axios 的錯誤對象提供更詳細的信息
      if (error.response) {
        // 伺服器回應了錯誤狀態碼
        console.error("伺服器回應錯誤:", error.response.status, error.response.data);
      } else if (error.request) {
        // 請求已發送但沒有收到回應
        console.error("沒有收到伺服器回應");
      } else {
        // 設置請求時發生錯誤
        console.error("請求設置錯誤:", error.message);
      }
    });
});
