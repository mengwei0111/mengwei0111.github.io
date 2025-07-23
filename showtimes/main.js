$(document).ready(function () {
  // 格式化日期為 YYYY-MM-DD
  function formatDate(date) {
    let yyyy = date.getFullYear();
    let mm = String(date.getMonth() + 1).padStart(2, "0");// 月份從 0 開始，所以需要加 1
    let dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  // 清空電影列表
  function clearMovieList() {
    $("#dynamic-movie-list").empty();
  }

  // 載入指定日期的電影資料
  function loadMoviesForDate(daysFromToday) {
    clearMovieList();

    // 計算目標日期
    let targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + daysFromToday);

    let nextDate = new Date(targetDate);
    nextDate.setDate(nextDate.getDate() + 1);

    let fromDate = formatDate(targetDate);
    let toDate = formatDate(nextDate);

    const API_URL = `https://api.showtimes.com.tw/1/events/listForCorporation/53?from=${fromDate}&to=${toDate}`;

    console.log(
      `✅ 載入 ${fromDate} 的電影資料:`,
      API_URL
    );

    // 原本的 axios 呼叫邏輯
    axios
      .get(API_URL)
      .then((response) => {
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
          let duration = `${Math.floor(program.duration / 3600)}小時${
            (program.duration / 60) % 60
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
            700,
            Object.keys(showtimesByVenue).length * 150
          );
          let movieCard = `
                    <div class="movie-card" style="background-image: url(${poster}); min-height: ${minHeight}px;">
                        <div class="movie-card__overlay"></div>
                        <div class="movie-card__content" style="display: flex; flex-direction: column; height: 100%; min-height: ${
                          minHeight - 40
                        }px;">
                            <div class="movie-card__header">
                                <h1 class="movie-card__title">${title}<br>${englishTitle}</h1>
                                <h4 class="movie-card__info">(${duration}) ${genres}</h4>
                            </div>
                            <p class="movie-card__desc">${description}</p>
                            <div style="flex-grow: 1;">
                                ${showtimeHtml}
                            </div>
                            <a href="${trailer}" target="_blank" class="btn btn-outline movie-card__button" style="margin-top: auto; align-self: center;">Watch Trailer</a>
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
          console.error(
            "伺服器回應錯誤:",
            error.response.status,
            error.response.data
          );
        } else if (error.request) {
          // 請求已發送但沒有收到回應
          console.error("沒有收到伺服器回應");
        } else {
          // 設置請求時發生錯誤
          console.error("請求設置錯誤:", error.message);
        }
      });
  }

  console.log("cccc");
  // 預設載入今天的資料
  loadMoviesForDate(0);
  console.log("aaaa");

  // 標籤點擊事件
  $(".tab-button").on("click", function () {
    console.log("bbbb");
    //$(".tab-button").removeClass("active"); // 清除其他按鈕的 active 狀態
    //$(this).addClass("active"); // 設置當前按鈕為 active class

    let daysFromToday = parseInt($(this).data("days"));
    loadMoviesForDate(daysFromToday);
  });
});
