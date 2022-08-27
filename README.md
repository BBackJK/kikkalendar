# kikkalendar


기깔린더.

내가 쓰려고 만든 calendar 

ui 작업 후 docker 로 db 연결까지 작업 계획중



기본 기능)

1. 캘린더 목록 화면
2. 해당 날짜의 이벤트 목록 화면
3. 등록 화면
4. 수정 화면

추가 기능)
option 에 callback 기능을 넣으면 [기본 기능] 의 2,3,4 를 캐치해서 잡아서 콜백함수를 실행.


callbackOnClickSelectDay: 선택한 일에 대한 이벤트 목록 가져오기.
callbackOnClickSelectDayAsync: 선택한 일에 대한 이벤트 목록 가져오는데 async 하게 가져오기 (api call).

callbackOnClickAddEvent: 이벤트 
