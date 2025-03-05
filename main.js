let stationData = []; // 儲存 JSON 資料
var table; // 儲存 DataTable

function renderTable(type) {

    table.clear().draw(); // 清空 DataTable

    // 篩選資料
    let filteredData = stationData.filter((station) => {
        if (type === "全部") return true;
        if (type === "加盟" && station.類別 === "加盟站") return true;
        if (type === "直營" && station.類別 === "自營站") return true;
        if (
            type === "其它" &&
            station.類別 != "自營站" &&
            station.類別 != "加盟站"
        )
            return true;

        return false;
    });

    console.log("🔍 篩選結果：", filteredData);

    // 將篩選後的資料新增至 DataTable
    filteredData.forEach((station) => {
        table.row.add([
            station.站代號,
            station.站名,
            `${station.縣市}<br>${station.鄉鎮區}`,
            getOils(station),
            getAddress(station),
            station.電話,
            station.營業時間,
            getServices(station),
        ]);
    });

    table.draw(); // 重新繪製表格
}

function getOils(station) { // 取得油品的 HTML 標籤
    const oils = []; // 儲存油品的陣列
    if (station.無鉛92) oils.push('<span class="badge bg-purple">無鉛92</span>');
    if (station.無鉛95) oils.push('<span class="badge bg-primary">無鉛95</span>');
    if (station.無鉛98) oils.push('<span class="badge bg-warning">無鉛98</span>');
    if (station.酒精汽油) oils.push('<span class="badge bg-success">酒精汽油</span>');
    if (station.煤油) oils.push('<span class="badge bg-danger">煤油</span>');
    if (station.超柴) oils.push('<span class="badge bg-dark">超柴</span>');
    return oils.join(" "); // 將陣列轉為字串
}

// function getOils(station) {
//   let oils = "";
//   if (station.無鉛92 == 1)
//     oils += '<span class="badge bg-purple">無鉛92</span>';
//   if (station.無鉛95 == 1)
//     oils += '<span class="badge bg-primary">無鉛95</span>';
//   if (station.無鉛98 == 1)
//     oils += '<span class="badge bg-warning">無鉛98</span>';
//   if (station.煤油 == 1) oils += '<span class="badge bg-danger">煤油</span>';
//   if (station.超柴) oils += '<span class="badge bg-dark">超柴</span>';
//   return oils;
// }

function getServices(station) { // 取得服務的 HTML 標籤
    const services = []; // 儲存服務的陣列
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
    return services.join(" "); // 將陣列轉為字串
}

function getAddress(station) { // 取得地址的 HTML 標籤
    return `${station.地址}
      <button class="btn btn-sm btn-outline-primary ms-2" 
        onclick="window.open('https://www.google.com/maps/@${station.緯度},${station.經度},120m/data=!3m1!1e3', 'GoogleMap', 'height=768,width=1024');">
        <i class="ri-map-pin-fill"></i> 查看地圖
      </button>`;
}

$(document).ready(function() {
    // 初始化 DataTable
    table = $('#cpc-stations').DataTable({
        lengthMenu: false,
        lengthChange: false,
        pageLength: 20,
        responsive: true,
        language: {
            url: 'https://cdn.datatables.net/plug-ins/1.12.1/i18n/zh-HANT.json'
        }
    });

    // 讀取 JSON 並初始化 DataTable
    fetch("stationinfo.json")
        .then((response) => response.json())
        .then((data) => {
            stationData = data; // 將 JSON 資料存入全域變數
            $("#cors-msg").remove(); // 移除 Local CORS 訊息  
            renderTable("全部"); // 重新渲染表格，預設顯示所有站點
        })
        .catch((error) => {
            console.error("讀取站點資料失敗:", error);
        });

    // 綁定按鈕點擊事件
    $(".filter button").on("click", function() {
        $(".filter button").removeClass("active"); // 移除所有按鈕的 active 類別
        $(this).addClass("active"); // 將目前按鈕新增 active 類別

        let selectedType = $(this).val(); // 取得目前按鈕的值
        console.log(selectedType); // 顯示目前按鈕的值
        renderTable(selectedType); // 重新渲染表格
    }); // 篩選站點

});