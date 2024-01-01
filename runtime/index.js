const baseUrl = "http://localhost:8080";
const endPoint = "/v1/api/"
const resource = 'title';
const isExit = false;

while (isExit === false) {
    try {
        const module = await import(await fetch(`${baseUrl}/${endPoint}/${resource}`));
        const scenario = new module.Sub();
        scenario.exec();
    } catch (error) {
        alert('[999]: シナリオファイルの取得に失敗しました。')
    }
}
