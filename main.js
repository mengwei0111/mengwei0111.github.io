$(document).ready(function () {
  let stationData = []; // 儲存 JSON 資料
  let table; // DataTable 物件

  // 讀取 JSON 並初始化 DataTable
  fetch("stationinfo.json")
    .then((response) => response.json())
    .then((data) => {
      stationData = data;

      // **只初始化一次 DataTable**
      table = $("#cpc-stations").DataTable({
        lengthChange: false,
        pageLength: 20,
        responsive: true,
        destroy: true, // 允許 DataTable 銷毀後重新繪製
        language: {
          url: "https://cdn.datatables.net/plug-ins/1.12.1/i18n/zh-HANT.json",
        },
      });

      renderTable("全部"); // 預設顯示所有站點
    });

  // 綁定按鈕點擊事件
  $(".filter button").on("click", function () {
    $(".filter button").removeClass("active");
    $(this).addClass("active");

    let selectedType = $(this).val(); 
    console.log(selectedType);
    console.log($(this));
    renderTable(selectedType);
  });

  function renderTable(type) {
    table.clear().draw(); // 清除舊資料

    let filteredData = stationData.filter((station) => {
      let stationType = station.類別
        ? station.類別.trim().normalize("NFKC")
        : "未定義";

      if (type === "全部") return true;
      if (type === "加盟" && stationType === "加盟站") return true;
      if (type === "直營" && stationType === "自營站") return true;
      if (type === "其它" && !["自營站", "加盟站"].includes(stationType))
        return true;

      return false;
    });

    console.log("🔍 篩選結果：", filteredData);

    filteredData.forEach((station) => {
      table.row.add([
        station.站代號,
        station.站名,
        `${station.縣市} ${station.鄉鎮區}`,
        getOils(station),
        getAddress(station),
        station.電話,
        station.營業時間,
        getServices(station),
      ]);
    });

    table.draw(); // **重新繪製表格**
  }

  function getOils(station) {
    const oils = [];
    if (station.無鉛92)
      oils.push('<span class="badge bg-purple">無鉛92</span>');
    if (station.無鉛95)
      oils.push('<span class="badge bg-primary">無鉛95</span>');
    if (station.無鉛98)
      oils.push('<span class="badge bg-warning">無鉛98</span>');
    if (station.煤油) oils.push('<span class="badge bg-danger">煤油</span>');
    if (station.超柴) oils.push('<span class="badge bg-dark">超柴</span>');
    return oils.join(" ");
  }

  function getServices(station) {
    const services = [];
    if (station.會員卡)
      services.push('<span class="badge bg-primary">會員卡</span>');
    if (station.電子發票)
      services.push('<span class="badge bg-purple">電子發票</span>');
    if (station.洗車)
      services.push('<span class="badge bg-danger">洗車</span>');
    if (station.刷卡自助)
      services.push('<span class="badge bg-success">刷卡自助</span>');
    if (services.length === 0)
      services.push('<span class="badge bg-info">無額外服務</span>');
    return services.join(" ");
  }

  function getAddress(station) {
    return `
      ${station.地址}
      <button class="btn btn-sm btn-outline-primary ms-2" 
        onclick="window.open('https://www.google.com/maps/@${station.緯度},${station.經度},120m/data=!3m1!1e3', 'GoogleMap', 'height=768,width=1024');">
        <i class="ri-map-pin-fill"></i> 查看地圖
      </button>
    `;
  }
});
