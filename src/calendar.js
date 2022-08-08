(function(global, factory) {
  if (typeof module === "object" && typeof module.exports === "object") {
    // node 환경 모듈 정의 (Browser 환경 X)
  } else {
    factory(global);
  }

})(typeof window !== "undefined" ? window : this, function (window) {

  Date.prototype.YYYYMMDD = function () {
    const yyyy = this.getFullYear().toString();
    const MM = zp(this.getMonth() + 1,2);
    const dd = zp(this.getDate(), 2);
    // var hh = zp(this.getHours(), 2);
    // var mm = zp(this.getMinutes(), 2)
    // var ss = zp(this.getSeconds(), 2)
  
    // return yyyy +  MM + dd+  hh + mm + ss;
    return yyyy +  MM + dd;
  };

  String.prototype.toDate = function () {
    if (this.length === 8) {
      var sYear = this.substring(0,4);
      var sMonth = this.substring(4,6);
      var sDate = this.substring(6,8);

      return new Date(Number(sYear), Number(sMonth)-1, Number(sDate));
    } else {
      return '';
    }
  }
  
  const zp = function (value, length) {
    let str = '' + value;
    while (str.length < length) {
      str = '0' + str;
    }
    return str;
  };

  // 사용할 클래스 명들
  const CLS_CAL_CONTAINER = '__calendar__container__';
  const CLS_CAL_CONTAINER_HEADER = '__calendar__container__header__';
  const CLS_CAL_CONTAINER_BODY = '__calendar__container__body__';

  const CLS_CAL_ARROW_PREV = '__calendar__arrow__prev__';
  const CLS_CAL_ARROW_NEXT = '__calendar__arrow__next__';
  const CLS_CAL_TODAY_BTN_AREA = '__calendar__button__area__';

  const CLS_CAL_SELECT_DATE = '__calendar__select__date__';
  const CLS_CURRNET_DATE_YEAR = '__current__select__year__';
  const CLS_CURRNET_DATE_MONTH = '__current__select__month__';

  const CLS_CAL_BODY_CONTENTS = '__calendar__contents__';
  const CLS_CAL_BODY_CONTENTS__HEADER = '__calendar__contents__header__';
  const CLS_CAL_BODY_HEADER_WEEK = '__header__day_of_week__';

  const CLS_CAL_BODY_CONTENTS__BODY = '__calendar__contents__body__';
  const CLS_CAL_BODY_BODY_DAY_BOX = '__body__day__box__';
  const CLS_CAL_BODY_BODY_DAY_BOX_DAY = '__day__';
  const CLS_CAL_BODY_BODY_DAY_PREV = '__prev__';
  const CLS_CAL_BODY_BODY_DAY_TODAY = '__today__';
  const CLS_CAL_BODY_BODY_DAY_NEXT = '__next__';
  const CLS_CAL_BODY_BODY_DAY_EVENTS = '__event__';

  const CLS_CAL_BODY_TYPE_CALENDAR = '__type_calendar__';
  const CLS_CAL_BODY_TYPE_INFO = '__type_info__';
  const CLS_CAL_BODY_TYPE_PICKER = '__type_picker__';
  const CLS_IS_ACTIVE = '__is_active__';

  const CLS_SELECT_INFO_DAY = '__calendar__select__day__';
  const CLS_SELECT_INFO_CLOSE_BTN = '__calendar__select__close__';

  const CLS_SELECT_INFO_EVENT_CONTAINER = '__contents__body__event__container__';
  const CLS_SELECT_INFO_EVENT_BOX = '__body__event__box__';
  const CLS_EVENT_EMPTY = '__empty__';

  // 이벤트 클릭 시 핸들링 할 수 있는 콜백함수명들
  const EVENT_SELECT_DAY_CLICK = 'callbackOnClickSelectDay';

  // 캘린더 기본 높이값
  const CALENDAR_DEFAULT_ELEMENT_HEIGHT_VALUE = 752;

  // global event 목록
  let g_events = [];

  const CALENDAR = function(rootId, _options) {

    rootId = rootId || 'my-calendar';

    const _this = this;

    _this.root = undefined;
    _this.currentMonthInfo = {
      year: new Date().getFullYear(), // 현재 선택한 달 년 정보
      month: new Date().getMonth() + 1, // 현재 선택한 달 정보
      date: new Date(), // 현재 선택한 달 정보
      startDate: undefined,
      endDate: undefined,
      today: new Date(),
    };
    _this.options = _options || {};

    init(_this, rootId);

    return Object.freeze(_this);
  };

  // 외부에서 접근할 수 있는 api 추가
  const fn = CALENDAR.fn = CALENDAR.prototype;

  // 루트 노트 가져오기
  fn.getRootNode = function () {
    const _this = this;
    return _this.root;
  };

  // 이벤트 넣기
  fn.addEvent = function () {
    if (!arguments.length || !arguments[0]) {
      console.error(' Empty arguments !!! push event object or event array list !!! ');
      return null;
    }

    let arr = [];

    if (Array.isArray(arguments[0])) {
      arr = arguments[0];
    } else if (arguments[0] && typeof arguments[0] === 'object') {
      arr.push(arguments[0]);
    }

    eventArrPushAndSort(this, arr);
  };

  // 초기화 함수
  const init = function (_context_, rootId) {
    _context_ = _context_ || new CALENDAR();

    _context_.root = getRootNode(rootId);

    if (isNotDrawableYn(_context_)) {
      console.error(' element id is not found ');
      return false;
    }

    // 이벤트 지정
    setNodeEvent(_context_);
    // 달력그리기
    drawCalendar(_context_);
  };

  // 달력 루트노드 get
  const getRootNode = function (rootId) {
    return document.getElementById(rootId);
  };

  // 달력을 그릴 수 있는 조건인지?
  const isNotDrawableYn = function (_context_) {
    _context_ = _context_ || new CALENDAR();
    return !_context_.root;
  };

  // 달력 그리기
  const drawCalendar = function (_context_) {

    if (isNotDrawableYn(_context_)) {
      console.error(' element id is not found ');
      return false;
    }

    const $root = _context_.root;

    $root.innerHTML = '';

    let nodeString = '<div class="' + CLS_CAL_CONTAINER + '">';
    nodeString += drawCalendarHeader();
    nodeString += drawCalendarBody();
    nodeString += '</div>';

    $root.innerHTML = nodeString;

    // 값 바인딩
    drawBindingData(_context_);
  };

  // 헤더 그리기
  const drawCalendarHeader = function () {

    let nodeString = '<div class="' + CLS_CAL_CONTAINER_HEADER + '">';
    nodeString += '<div>';
    nodeString += '<div class="' + CLS_CAL_ARROW_PREV + '" name="' + CLS_CAL_ARROW_PREV + '">&lt;</div>';
    nodeString += '<div class="' + CLS_CAL_ARROW_NEXT + '" name="' + CLS_CAL_ARROW_NEXT + '">&gt;</div>';
    nodeString += '</div>';
    nodeString += '<div class="' + CLS_CAL_SELECT_DATE + '">';
    nodeString += '<span class="' + CLS_CURRNET_DATE_YEAR + '" name="' + CLS_CURRNET_DATE_YEAR + '">' + 0 + '</span>';
    nodeString += '<span> . </span>';
    nodeString += '<span class="' + CLS_CURRNET_DATE_MONTH + '" name="' + CLS_CURRNET_DATE_MONTH + '">' + 0 + '</span>';
    nodeString += '</div>';
    nodeString += '<div class="' + CLS_CAL_TODAY_BTN_AREA + '"><button type="button" name="' + CLS_CAL_TODAY_BTN_AREA + '">TODAY</button></div>';
    nodeString += '</div>';

    return nodeString;
  };

  // 바디 그리기
  const drawCalendarBody = function () {

    let nodeString = '<div class="' + CLS_CAL_CONTAINER_BODY + '">';
    nodeString += drawCalendarBodyTypeCalendar();
    nodeString += drawCalendarBodyTypeInfo();
    nodeString += '</div>';

    return nodeString;
  };

  // 바디 - 타입이 캘린더 인거 그리기.
  const drawCalendarBodyTypeCalendar = function () {
    let nodeString = '<div class="' + CLS_CAL_BODY_CONTENTS + ' ' + CLS_CAL_BODY_TYPE_CALENDAR + ' ' + CLS_IS_ACTIVE + '">';
    nodeString += drawDayOfWeek();
    nodeString += '<div class="' + CLS_CAL_BODY_CONTENTS__BODY + '" name="' + CLS_CAL_BODY_CONTENTS__BODY + '"></div>';
    nodeString += '</div>';

    return nodeString;
  };

  // 바디 - 타입이 info 인거 그리기
  const drawCalendarBodyTypeInfo = function () {

    let nodeString = '<div class="' + CLS_CAL_BODY_CONTENTS + ' ' + CLS_CAL_BODY_TYPE_INFO + '">';
    nodeString += '<div class="' + CLS_CAL_BODY_CONTENTS__HEADER + '">';
    nodeString += '<div class="' + CLS_SELECT_INFO_DAY + '" name="' + CLS_SELECT_INFO_DAY + '"></div>';
    nodeString += '<div class="' + CLS_SELECT_INFO_CLOSE_BTN + '" name="' + CLS_SELECT_INFO_CLOSE_BTN + '"></div>';
    nodeString += '</div>';
    nodeString += '<div class="' + CLS_CAL_BODY_CONTENTS__BODY + '">';
    nodeString += '<div class="' + CLS_SELECT_INFO_EVENT_CONTAINER + '">';
    nodeString += '<div class="' + CLS_SELECT_INFO_EVENT_BOX + '  ' + CLS_EVENT_EMPTY + '"><p>이벤트 목록이 없습니다.</p></div>';
    nodeString += '</div>';
    nodeString += '</div>';
    nodeString += '</div>';
    return nodeString;
  }

  // 요일 그리기
  const drawDayOfWeek = function () {
    let nodeString = '<div class="' + CLS_CAL_BODY_CONTENTS__HEADER + '">';
    nodeString += '<div class="' + CLS_CAL_BODY_HEADER_WEEK + '">일</div>';
    nodeString += '<div class="' + CLS_CAL_BODY_HEADER_WEEK + '">월</div>';
    nodeString += '<div class="' + CLS_CAL_BODY_HEADER_WEEK + '">화</div>';
    nodeString += '<div class="' + CLS_CAL_BODY_HEADER_WEEK + '">수</div>';
    nodeString += '<div class="' + CLS_CAL_BODY_HEADER_WEEK + '">목</div>';
    nodeString += '<div class="' + CLS_CAL_BODY_HEADER_WEEK + '">금</div>';
    nodeString += '<div class="' + CLS_CAL_BODY_HEADER_WEEK + '">토</div>';
    nodeString += '</div>';
    return nodeString;
  };

  // root를 기반으로.. 동적 이벤트 등록
  const setNodeEvent = function (_context_) {
    const $root = _context_.root;

    if ($root) {
      // 이벤트는 name을 기반으로 건다.
      $root.addEventListener('click', function (e) {
        const $attrName = e.target.getAttribute('name');

        switch($attrName) {
          case CLS_CAL_ARROW_PREV:  // 이전달 클릭 이벤트
            calPrevMonth(_context_);
            break;
          case CLS_CAL_ARROW_NEXT:  // 다음달 클릭 이벤트
            calNextMonth(_context_);
            break;
          case CLS_CAL_TODAY_BTN_AREA:  // 오늘날 클릭
            goToToday(_context_);
            break;
          case CLS_CAL_BODY_BODY_DAY_BOX: // 일 클릭
            selectDayClickEvent(_context_, e.target);
            break;
          case CLS_SELECT_INFO_CLOSE_BTN: // 캘린더 바디 타입이 info 일 때 close 버튼 클릭 이벤트
            changeCalContentsBodyOfCalendar(_context_);
            break;
        }
      });
    }
  };

  // 이전 달 계산 -> 계산 후 캘린더 바디의 바디를 다시그려야함.
  const calPrevMonth = function (_context_) {
    const currentSelectDate = _context_.currentMonthInfo.date;

    const prevMonth = new Date(currentSelectDate.setMonth(currentSelectDate.getMonth() - 1)); 
    
    _context_.currentMonthInfo.date = prevMonth;
    _context_.currentMonthInfo.year = prevMonth.getFullYear();
    _context_.currentMonthInfo.month = prevMonth.getMonth() + 1;

    drawBindingData(_context_);
  };

  // 다음 달 계산
  const calNextMonth = function (_context_) {
    const currentSelectDate = _context_.currentMonthInfo.date;

    const nextMonth = new Date(currentSelectDate.setMonth(currentSelectDate.getMonth() + 1)); 

    _context_.currentMonthInfo.date = nextMonth;
    _context_.currentMonthInfo.year = nextMonth.getFullYear();
    _context_.currentMonthInfo.month = nextMonth.getMonth() + 1;

    drawBindingData(_context_);
  };

  // 오늘날로 점프
  const goToToday = function (_context_) {

    const today = new Date();

    _context_.currentMonthInfo.date = today;
    _context_.currentMonthInfo.year = today.getFullYear();
    _context_.currentMonthInfo.month = today.getMonth() + 1;
    _context_.currentMonthInfo.today = today;

    drawBindingData(_context_);
  };

  // 선택한 날 클릭 이벤트
  const selectDayClickEvent = function (_context_, target) {

    // TODO: 나중에 public api 로 뽑을 때 공통 함수로 작업해야함. 인자를 date로 변환가능한 string으로 받고.. getFormatDate 함수로 date를 변환 받고 작업해야할 것 같음..

    const $targetDayId = target.getAttribute('id'); // d20220701
    const targetDateOfDayId = $targetDayId ? $targetDayId.substr(1).toDate() : null;

    const $eventContainer = target.querySelector('.' + CLS_CAL_BODY_BODY_DAY_EVENTS);
    const $evnetContainerItems = $eventContainer.getElementsByTagName('div');
    const $eventContainerItemsCount = $evnetContainerItems.length;

    // 이벤트 목록
    let targetEventList = [];

    // 해당 날짜의 이벤트 목록 뽑아내기
    if ($eventContainerItemsCount) {
      for (let i = 0; i < $eventContainerItemsCount; i++) {
        const $eventContainerItem = $evnetContainerItems[i];
        g_events = g_events || [];
        const targetEvent = g_events.filter(function (event) {
          return event && event.id && $eventContainerItem && $eventContainerItem.dataset && event.id === $eventContainerItem.dataset.id;
        })[0];

        targetEventList.push(targetEvent);
      }
    }

    // 사용자가 설정한 옵션에 해당 이벤트 키값이 있으면 그 함수로 호출
    if (_context_ && _context_.options && _context_.options[EVENT_SELECT_DAY_CLICK]) {

      const callbackFunc = _context_.options[EVENT_SELECT_DAY_CLICK];

      if (!(callbackFunc instanceof Function)) {
        console.error(' ' + EVENT_SELECT_DAY_CLICK + ' is callback function. please checking parameters ');
        return false;
      }

      const parameter = {
        date: targetDateOfDayId,
        eventList: targetEventList,
      }
      
      callbackFunc(parameter);
      return false;

    } else {

      // 아니면 설정한 이벤트 사용

      // 현재 캘린더 높이 값 구하기
      const calendarTypeContents = getNodeElementByCalContentsType(_context_, CLS_CAL_BODY_TYPE_CALENDAR);
      const calendarTypeContentsHeight = calendarTypeContents ? calendarTypeContents.clientHeight + 1 : CALENDAR_DEFAULT_ELEMENT_HEIGHT_VALUE;

      // 구한 높이값으로 contents 바디값 설정
      const infoTypeContents = getNodeElementByCalContentsType(_context_, CLS_CAL_BODY_TYPE_INFO);
      if (infoTypeContents && infoTypeContents.style) {
        infoTypeContents.style.height = calendarTypeContentsHeight + 'px';
      }

      bindSelectDay(_context_, targetDateOfDayId);
      resetSelectDayEvent(_context_); // 이벤트 목록 class 초기화
      bindSelectDayEventList(_context_, targetEventList);  // TODO: 선택한 날짜 이벤트 목록 바인딩.

      // info 타입만 활성화 시키기
      showCalContentsBodyOfType(_context_, CLS_CAL_BODY_TYPE_INFO);
    }
  }

  // 타입 캘린더로 지정
  const changeCalContentsBodyOfCalendar = function (_context_) {
    showCalContentsBodyOfType(_context_, CLS_CAL_BODY_TYPE_CALENDAR);
  }

  // 공통 그리기
  const drawBindingData = function (_context_) {
    // g_events = [];
    // 값 바인딩

    // 이벤트 초기화
    resetEvent(_context_);

    // 달력 그린 후
    bindSelectDate(_context_);
    bindCalendarDays(_context_);

    // 이벤트 그리기
    drawEvent(_context_);
  };

  // 선택한 날짜 년월 바인딩 
  const bindSelectDate = function (_context_) {
    const $root = _context_.root;

    const $currnetYear = $root.querySelector('[name="' + CLS_CURRNET_DATE_YEAR + '"]');
    const $currnetMonth = $root.querySelector('[name="' + CLS_CURRNET_DATE_MONTH + '"]');

    if ($currnetYear && $currnetMonth) {
      $currnetYear.innerText = _context_.currentMonthInfo.year;
      $currnetMonth.innerText = _context_.currentMonthInfo.month < 10 ? '0' + _context_.currentMonthInfo.month : _context_.currentMonthInfo.month;
    }
  };

  // 선택한 날짜 일 그리기 바인딩
  const bindCalendarDays = function (_context_) {

    const $root = _context_.root;

    const $calContentsBody = $root.querySelector('[name="' + CLS_CAL_BODY_CONTENTS__BODY + '"]');

    let prevDayArr = getPrevDayList(_context_); // 이전 달 일 목록 가져오기
    let currentDayArr = getCurrentDayList(_context_); // 현재 달 일 목록 가져오기
    let nextDayArr = getNextDayList(_context_);  // 다음 달 일 목록 가져오기

    // 일 그리기
    let nodeString = '';

    if (Array.isArray(prevDayArr)) {
      const prevDayArrSize = prevDayArr.length;
      for (let i=0; i < prevDayArrSize; i++) {

        const day = prevDayArr[i];

        if (i === 0) { // 달력 그리기 시작일 체크
          _context_.currentMonthInfo.startDate = day.id ? day.id.toDate() : null;
        }

        nodeString += '<div class="' + CLS_CAL_BODY_BODY_DAY_BOX + ' ' + CLS_CAL_BODY_BODY_DAY_PREV + '" id="d' + day.id + '" name="' + CLS_CAL_BODY_BODY_DAY_BOX + '">';
        nodeString += '<div class="' + CLS_CAL_BODY_BODY_DAY_BOX_DAY + '">' + day.day + '</div>'
        nodeString += '<div class="' + CLS_CAL_BODY_BODY_DAY_EVENTS + '"></div>'
        nodeString += '</div>';
      }
    }

    if (Array.isArray(currentDayArr)) {
      currentDayArr.forEach(function (day) {

        const todayYn = isTodayYn(_context_, day.day);

        nodeString += '<div class="' + CLS_CAL_BODY_BODY_DAY_BOX;
        if (todayYn) nodeString += ' ' + CLS_CAL_BODY_BODY_DAY_TODAY;
        nodeString += '" id="d' + day.id + '"  name="' + CLS_CAL_BODY_BODY_DAY_BOX + '">';
        nodeString += '<div class="' + CLS_CAL_BODY_BODY_DAY_BOX_DAY + '">';
        if (todayYn) nodeString += '<span>';
        nodeString += day.day;
        if (todayYn) nodeString += '</span>';
        nodeString += '</div>'
        nodeString += '<div class="' + CLS_CAL_BODY_BODY_DAY_EVENTS + '"></div>'
        nodeString += '</div>';
      });
    }

    if (Array.isArray(nextDayArr)) {
      const nextDayArrSize = nextDayArr.length;

      for (let k=0; k < nextDayArrSize; k++) {
        const day = nextDayArr[k];

        if (k === (nextDayArrSize - 1)) {
          _context_.currentMonthInfo.endDate = day.id ? day.id.toDate() : null;
        }

        nodeString += '<div class="' + CLS_CAL_BODY_BODY_DAY_BOX + ' ' + CLS_CAL_BODY_BODY_DAY_NEXT + '" id="d' + day.id + '"  name="' + CLS_CAL_BODY_BODY_DAY_BOX + '">';
        nodeString += '<div class="' + CLS_CAL_BODY_BODY_DAY_BOX_DAY + '">' + day.day + '</div>'
        nodeString += '<div class="' + CLS_CAL_BODY_BODY_DAY_EVENTS + '"></div>'
        nodeString += '</div>';
      }
    }

    $calContentsBody.innerHTML = nodeString;
  };

  // 선택한 일 정보 바인딩
  const bindSelectDay = function (_context_, selectedDate) {

    const $infoTypeContents = getNodeElementByCalContentsType(_context_, CLS_CAL_BODY_TYPE_INFO);

    if ($infoTypeContents) {
      const $infoTypeContentsHeader = $infoTypeContents.querySelector('.' + CLS_CAL_BODY_CONTENTS__HEADER);

      if ($infoTypeContentsHeader) {
        const $selectDayDiv = $infoTypeContentsHeader.querySelector('[name="' + CLS_SELECT_INFO_DAY + '"]');
        if ($selectDayDiv) {
          const selectYear = selectedDate && selectedDate instanceof Date ? selectedDate.getFullYear() : new Date().getFullYear();
          const selectMonth = selectedDate && selectedDate instanceof Date ? selectedDate.getMonth() + 1 : new Date().getMonth() + 1;
          const selectDay = selectedDate && selectedDate instanceof Date ? selectedDate.getDate() : new Date().getDate();

          $selectDayDiv.innerText = selectYear + '. ' + zp(selectMonth, 2) + '. ' + zp(selectDay, 2);
        }
      }
    }
  }

  // 이벤트 목록 class 초기화
  const resetSelectDayEvent = function (_context_) {
    const $infoTypeContents = getNodeElementByCalContentsType(_context_, CLS_CAL_BODY_TYPE_INFO);

    if ($infoTypeContents) {
      const $infoTypeContentsBody = $infoTypeContents.querySelector('.' + CLS_CAL_BODY_CONTENTS__BODY);

      if ($infoTypeContentsBody) {
        const $infoTypeContentsBodyEventContainer = $infoTypeContentsBody.querySelector('.' + CLS_SELECT_INFO_EVENT_CONTAINER);

        if ($infoTypeContentsBodyEventContainer) {
          $infoTypeContentsBodyEventContainer.innerHTML = '<div class="' + CLS_SELECT_INFO_EVENT_BOX + '  ' + CLS_EVENT_EMPTY + '"><p>이벤트 목록이 없습니다.</p></div>';
        }
      }
    }
  };

  // 선택한 일에 대한 이벤트 목록 바인딩
  const bindSelectDayEventList = function (_context_, eventList) {
    
    if (!eventList || !Array.isArray(eventList) || !eventList.length) {
      return false;
    }

    const $infoTypeContents = getNodeElementByCalContentsType(_context_, CLS_CAL_BODY_TYPE_INFO);

    if ($infoTypeContents) {
      const $infoTypeContentsBody = $infoTypeContents.querySelector('.' + CLS_CAL_BODY_CONTENTS__BODY);

      if ($infoTypeContentsBody) {
        const $infoTypeContentsBodyEventContainer = $infoTypeContentsBody.querySelector('.' + CLS_SELECT_INFO_EVENT_CONTAINER);

        console.log($infoTypeContentsBodyEventContainer);
        console.log(eventList);
        // TODO: 작업해야함.
        /*
        diffDays: 9
        end: "2022-08-12"
        endDate: Fri Aug 12 2022 00:00:00 GMT+0900 (한국 표준시) {}
        endDateId: "20220812"
        id: "2f669b14b9694c18816128217de37158"
        start: "2022-08-03"
        startDate: Wed Aug 03 2022 00:00:00 GMT+0900 (한국 표준시) {}
        startDateId: "20220803"
        title: "21321321"
        */
      }
    }
  };

  // 현재 선택한 날짜의 이전 일자 달력 계산
  const getPrevDayList = function (_context_) {
    const currentYear = _context_.currentMonthInfo.year;
    const currentMonth = _context_.currentMonthInfo.month;

    // 요일 day 정보
    // 일요일 : 0
    // 월요일 : 1
    // 화요일 : 2
    // 수요일 : 3
    // 목요일 : 4
    // 금요일 : 5
    // 토요일 : 6

    // 이전 달의 마지막 date
    const prevMonthLastDate = new Date(currentYear, currentMonth - 1, 0);
    // 이전 달의 마지막 date 의 요일 정보
    const prevMonthLastDateDayOfWeek = prevMonthLastDate.getDay();
    // 이전 달의 마지막 date 의 일 정보
    const prevMonthLastDateDay = prevMonthLastDate.getDate();


    const prevMonthLastDateYear = prevMonthLastDate.getFullYear();
    const prevMonthLastDateMonth = prevMonthLastDate.getMonth() + 1;
    const dayComponentPrefixId = prevMonthLastDateYear.toString() + (prevMonthLastDateMonth < 10 ? '0' + prevMonthLastDateMonth : prevMonthLastDateMonth.toString());

    let arr = [];

    // 이전달 구하기
    for (let i=0; i <= prevMonthLastDateDayOfWeek; i++) {
      const day = prevMonthLastDateDay - (prevMonthLastDateDayOfWeek - i);
      arr.push(
        {
          id: dayComponentPrefixId + zp(day.toString(), 2),
          day: day
        }
      );
    }

    return arr;
  };

  // 현재 선택한 날짜의 현재 일자 달력 계산
  const getCurrentDayList = function (_context_) {
    const currentYear = _context_.currentMonthInfo.year;
    const currentMonth = _context_.currentMonthInfo.month;

    // 요일 day 정보
    // 일요일 : 0
    // 월요일 : 1
    // 화요일 : 2
    // 수요일 : 3
    // 목요일 : 4
    // 금요일 : 5
    // 토요일 : 6


    // 현재 달의 마지막 date
    const selectMonthLastDate = new Date(currentYear, currentMonth, 0);
    // 현재 달의 마지막 date 의 일 정보
    const selectMonthLastDateDayOfWeek = selectMonthLastDate.getDay();
    // 현재 달의 마지막 date 의 일 정보
    const selectMonthLastDateDay = selectMonthLastDate.getDate();

    const selectMonthLastDateYear = selectMonthLastDate.getFullYear();
    const selectMonthLastDateMonth = selectMonthLastDate.getMonth() + 1;
    const dayComponentPrefixId = selectMonthLastDateYear.toString() + (selectMonthLastDateMonth < 10 ? '0' + selectMonthLastDateMonth : selectMonthLastDateMonth.toString());

    let arr = [];

    // 현재달 구하기
    for (let j=1; j<= selectMonthLastDateDay; j++) {
      day = j;
      arr.push(
        {
          id: dayComponentPrefixId + zp(j.toString(), 2),
          day: day,
        }
        );
    }

    return arr;
  };

  // 현재 선택한 날짜의 다음 일자 달력 계산
  const getNextDayList = function (_context_) {
    const currentYear = _context_.currentMonthInfo.year;
    const currentMonth = _context_.currentMonthInfo.month;

    // 요일 day 정보
    // 일요일 : 0
    // 월요일 : 1
    // 화요일 : 2
    // 수요일 : 3
    // 목요일 : 4
    // 금요일 : 5
    // 토요일 : 6

    let arr = [];

    // 현재 달의 마지막 date
    const selectMonthLastDate = new Date(currentYear, currentMonth, 0);
    // 현재 달의 마지막 date 의 일 정보
    const selectMonthLastDateDayOfWeek = selectMonthLastDate.getDay();

    // 다음 달의 첫 date
    const nextMonthLastDate = new Date(currentYear, currentMonth + 1, 1);
    const nextMonthLastDateYear = nextMonthLastDate.getFullYear();
    const nextMonthLastDateMonth = nextMonthLastDate.getMonth();
    const dayComponentPrefixId = nextMonthLastDateYear.toString() + (nextMonthLastDateMonth < 10 ? '0' + nextMonthLastDateMonth : nextMonthLastDateMonth.toString());

    // 다음달 구하기
    let nextMonthStartDay = 1;
    for (let z=selectMonthLastDateDayOfWeek + 1; z <= 6 ; z++) {
      const day = nextMonthStartDay++;
      arr.push(
        {
          id: dayComponentPrefixId + zp(day.toString(), 2),
          day: day
        }
        );
    }

    return arr;
  };

  // 해당 일이 오늘날인지 계산
  const isTodayYn = function (_context_, day) {
    const today = _context_.currentMonthInfo.today;

    const todayYear = today.getFullYear();
    const todayMonth = today.getMonth() + 1;
    const todayDay = today.getDate();

    const currentSelectYear = _context_.currentMonthInfo.year;
    const currentSelectMonth = _context_.currentMonthInfo.month;

    return todayYear === currentSelectYear &&
        todayMonth === currentSelectMonth &&
        todayDay === day;
  };

  // 이벤트 목록 넣고 정렬
  const eventArrPushAndSort = function (_context_, inputArr) {
    g_events = g_events.concat(inputArr);
    if (Array.isArray(g_events)) {
      
      const eventArrSize = g_events.length;

      // 데이터 포맷 작업
      for (let i=0; i < eventArrSize ; i++) {
        let _event = g_events[i];

        _event.diffDays = _event.diffDays || 0;
        _event.id = _event.id || uuidv4();  // id 값이 있으면 id 값을 사용. 없으면 uuid로 대체

        if (_event.start) {
          _event.startDate = getFormatDate(_event.start);
          _event.startDateId = _event.startDate && _event.startDate instanceof Date ? _event.startDate.YYYYMMDD() : _event.startDate;
        }

        if (_event.end) {
          _event.endDate = getFormatDate(_event.end);
          _event.endDateId = _event.endDate && _event.endDate instanceof Date ? _event.endDate.YYYYMMDD() : _event.endDate;
        }

        if (_event.startDate && _event.startDate instanceof Date && _event.endDate && _event.endDate instanceof Date) {
          const diff = _event.endDate.getTime() - _event.startDate.getTime();
          _event.diffDays = Math.ceil(diff / (1000 * 3600 * 24));
        }
      }

      // 데이터 정렬
      g_events = g_events.sort(function (a, b) {
        return a.startDate - b.startDate;
      }).filter(function (_event) {
        return _event.startDate && _event.endDate;
      });

      console.log(g_events);
      drawEvent(_context_);
    }
  };

  // 01/09/2022, 19:00:00 or 01/09/2022 19:00:00
  const STR_DATE_FORMAT_DATETIME_REVERSE_SLASH_REG = /^[0-9]{1,2}\/[0-9]{1,2}\/[0-9]{4}[,]?\s[0-9]{1,2}\:[0-9]{1,2}\:[0-9]{1,2}$/;
  // 01/09/2022
  const STR_DATE_FORMAT_DATE_REVERSE_SLASH_REG = /^[0-9]{1,2}\/[0-9]{1,2}\/[0-9]{4}$/;
  // 2022/09/01 18:00:00
  const STR_DATE_FORMAT_DATETIME_SLASH_REG = /^[0-9]{4}\/[0-9]{1,2}\/[0-9]{1,2}\s[0-9]{1,2}\:[0-9]{1,2}\:[0-9]{1,2}$/;
  // 2022/09/01
  const STR_DATE_FORMAT_DATE_SLASH_REG = /^[0-9]{4}\/[0-9]{1,2}\/[0-9]{1,2}$/;

  // 2022-09-01 18:00:00
  const STR_DATE_FORMAT_DATETIME_HYPHEN_REG = /^[0-9]{4}\-[0-9]{1,2}\-[0-9]{1,2}\s[0-9]{1,2}\:[0-9]{1,2}\:[0-9]{1,2}$/;
  // 2022-09-01
  const STR_DATE_FORMAT_DATE_HYPHEN_REG = /^[0-9]{4}\-[0-9]{1,2}\-[0-9]{1,2}$/;

  // 2022-09-01 18:00:00
  const STR_DATE_FORMAT_DATETIME_DOT_REG = /^[0-9]{4}\.[0-9]{1,2}\.[0-9]{1,2}\s[0-9]{1,2}\:[0-9]{1,2}\:[0-9]{1,2}$/;
  // 2022-09-01
  const STR_DATE_FORMAT_DATE_DOT_REG = /^[0-9]{4}\.[0-9]{1,2}\.[0-9]{1,2}$/;

  // 20220901180000
  const STR_DATE_FORMAT_DATETIME_STREAM_REG = /^[0-9]{4}[0-9]{1,2}[0-9]{1,2}[0-9]{1,2}[0-9]{1,2}[0-9]{1,2}$/;
  // 20220901
  const STR_DATE_FORMAT_DATE_STREAM_REG = /^[0-9]{4}[0-9]{1,2}[0-9]{1,2}$/;

  // iso string
  const STR_DATE_FORMAT_ISO_REG = /^(?:\d{4})-(?:\d{2})-(?:\d{2})T(?:\d{2}):(?:\d{2}):(?:\d{2}(?:\.\d*)?)(?:(?:-(?:\d{2}):(?:\d{2})|Z)?)$/;

  // value 로 부터 format을 확인하여 date 로 반환.
  const getFormatDate = function (value) {

    if (STR_DATE_FORMAT_DATETIME_HYPHEN_REG.test(value) || STR_DATE_FORMAT_DATE_HYPHEN_REG.test(value)) {
      value = value.replace(/\-/gi, '/');
    } else if (STR_DATE_FORMAT_DATETIME_DOT_REG.test(value) || STR_DATE_FORMAT_DATE_DOT_REG.test(value)) {
      value = value.replace(/\./, '/');
    }

    let date = new Date(value);
    return !isNaN(date) && date instanceof Date ? date : null;
  };

  // 이벤트 그리기
  const drawEvent = function (_context_) {
    const $root = _context_.root;

    if ($root) {

      const $calendarBody = $root.querySelector('[name="' + CLS_CAL_BODY_CONTENTS__BODY + '"]');

      resetEvent(_context_);

      if ($calendarBody) {

        let eventListSize = g_events.length;

        for (let i = 0; i < eventListSize; i++) {

          const eventInfo = g_events[i];

          // TODO: 방어로직 작성
          let startDate = new Date(eventInfo.startDate.getTime()); // startDate 의 deepCopy
          let endDate = new Date(eventInfo.endDate.getTime()); // endDate 의 deepCopy
          
          let startEndCheckIndex = 0;
          let startEventIndex = 1;

          for (startDate; startDate <= endDate; startDate.setDate(startDate.getDate() + 1)) {

            let searchId = '#d' + startDate.YYYYMMDD();
            
            const $target = $calendarBody.querySelector(searchId);

            if ($target) {
              const $eventContainer = $target.querySelector('.' + CLS_CAL_BODY_BODY_DAY_EVENTS);
              const $eventContainerItemsCount = $eventContainer.getElementsByTagName('div').length;
  
              let bankUpCount = $eventContainerItemsCount + 1;
  
              // 시작일의 value index 는 2이고 쌓인건 1일 때..
              if (startEventIndex > bankUpCount) {
  
                // 차이만큼 생성해주어야 한다.
                for (let z = 0; z < startEventIndex - bankUpCount; z++) {
                  // 비어있는 이벤트 block 생성
                  const eventEmptyBlock = document.createElement('div');
                  // TODO: 가독성을 위해 classList로 작업해보는게 어떨까?
                  eventEmptyBlock.className += ' value' + (z+1) + ' ';
                  eventEmptyBlock.className += ' empty ';
  
                  // 비어있는 title span 생성
                  const eventEmptyTitle = document.createElement('span');
                  eventEmptyBlock.appendChild(eventEmptyTitle);
                  $eventContainer.appendChild(eventEmptyBlock); // 비어 있는 event block 먼저 붙히기
                }
  
                bankUpCount = startEventIndex;
              }
  
              // 이벤트 div 생성
              const eventBlock = document.createElement('div');
              eventBlock.className += ' value' + bankUpCount + ' '; // 시작일 이 해당 일에 몇번째 이벤트인지 인덱싱
              eventBlock.dataset.id = eventInfo.id || uuidv4();
  
              // 하루짜리면..
              if (eventInfo.diffDays < 1) {
                eventBlock.className += ' single ';
              } else {
  
                // 이벤트 시작일 체크
                if (startEndCheckIndex === 0) {
  
                  startEventIndex = bankUpCount;  // 시작일의 event count 체크
                  eventBlock.className += ' start ';
                } 
                // 마지막일 체크
                if (startEndCheckIndex === eventInfo.diffDays) {
                  eventBlock.className += ' end ';
                }
  
                eventBlock.className += ' full ';
              }
        
              // 이벤트 div에 title 붙힐 span 생성
              const eventTitle = document.createElement('span');
              // 이벤트 시작일에만 타이틀 적용
              if (startEndCheckIndex === 0) {
                eventTitle.innerText = eventInfo.title || '';
              }
  
              // 해당 event block에 span child 추가
              eventBlock.appendChild(eventTitle);
  
              $eventContainer.appendChild(eventBlock);
              startEndCheckIndex++;
            }
          }

        }
      }
    }    
  };

  // 전체 달력에 이벤트 목록 초기화
  const resetEvent = function (_context_) {
    const $root = _context_.root;

    if ($root) {
      const $calendarBody = $root.querySelector('[name="' + CLS_CAL_BODY_CONTENTS__BODY + '"]');

      if ($calendarBody) {
        const $eventBoxContainer = $calendarBody.querySelectorAll('.' + CLS_CAL_BODY_BODY_DAY_EVENTS);

        const $eventBoxContainerSize = $eventBoxContainer ? $eventBoxContainer.length : 0;

        for (let i = 0; i < $eventBoxContainerSize; i++) {
          const $eventBox = $eventBoxContainer[i];

          $eventBox.innerHTML = ''; // 초기화
        }
      }
    }
  };

  // 캘린더 바디 목록 중 해당 타입만 is-active 로 보여주기
  const showCalContentsBodyOfType = function(_context_, contentsBodyTypeClassName) {
    const $root = _context_.root;
    const $calendarContentsList = $root.querySelectorAll('.' + CLS_CAL_BODY_CONTENTS);
    
    if ($calendarContentsList) {

      for (let i = 0; i < $calendarContentsList.length; i++) {
        const $calendarContents = $calendarContentsList[i];

        if ($calendarContents && $calendarContents.classList) {
          if (!$calendarContents.classList.contains(contentsBodyTypeClassName)) {
            $calendarContents.classList.remove(CLS_IS_ACTIVE);
          } else {
            $calendarContents.classList.add(CLS_IS_ACTIVE);
          }
        }
      }
    }
  };

  // 캘린더 바디 타입에 해당하는 node 가져오기
  const getNodeElementByCalContentsType = function (_context_, contentsBodyTypeClassName) {
    const $root = _context_.root;
    const $calendarContentsList = $root.querySelectorAll('.' + CLS_CAL_BODY_CONTENTS);
    
    let result = null;

    if ($calendarContentsList) {

      for (let i = 0; i < $calendarContentsList.length; i++) {
        const $calendarContents = $calendarContentsList[i];

        if ($calendarContents && $calendarContents.classList) {
          if ($calendarContents.classList.contains(contentsBodyTypeClassName)) {
            result = $calendarContents;
          }
        }
      }
    }

    return result;
  };

  // uuid generates
  const uuidv4 = function () {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  window.CALENDAR = CALENDAR;

  return CALENDAR;
});
