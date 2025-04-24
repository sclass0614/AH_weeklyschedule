// DOM 요소
const startWeekInput = document.getElementById('startWeek');
const endWeekInput = document.getElementById('endWeek');
const generateCalendarBtn = document.getElementById('generateCalendar');
const printCalendarBtn = document.getElementById('printCalendar');
const calendarContainer = document.getElementById('calendarContainer');

// 모달 관련 요소
const alertModal = document.getElementById('alertModal');
const alertMessage = document.getElementById('alertMessage');
const alertTitle = document.getElementById('alertTitle');
const confirmModal = document.getElementById('confirmModal');
const confirmMessage = document.getElementById('confirmMessage');
const confirmTitle = document.getElementById('confirmTitle');
const confirmOkBtn = document.getElementById('confirmOk');
const confirmCancelBtn = document.getElementById('confirmCancel');
const closeAlertBtns = document.querySelectorAll('.close-alert');
const alertConfirmBtn = document.querySelector('.alert-confirm-btn');

// 공휴일 모달 요소들
let holidayModal;
let holidayInput;
let holidaySaveBtn;
let holidayCancelBtn;
let holidayRemoveBtn;
let currentHolidayHeader;

// 요일 이름 배열
const weekdays = ['일', '월', '화', '수', '목', '금', '토'];

// 이벤트 리스너 등록
document.addEventListener('DOMContentLoaded', function() {
    generateCalendarBtn.addEventListener('click', generateCalendars);
    printCalendarBtn.addEventListener('click', printCalendars);
    
    // 모달 닫기 버튼
    closeAlertBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            alertModal.style.display = 'none';
            confirmModal.style.display = 'none';
        });
    });
    
    // 알림 모달 확인 버튼
    alertConfirmBtn.addEventListener('click', function() {
        alertModal.style.display = 'none';
    });
    
    // 공휴일 모달 생성
    createHolidayModal();
    
    // 오늘 날짜가 속한 주차를 기본값으로 설정
    setCurrentWeekAsDefault();
});

/**
 * 오늘 날짜가 속한 주차를 시작 주차와 종료 주차에 기본값으로 설정
 */
function setCurrentWeekAsDefault() {
    const today = new Date();
    const year = today.getFullYear();
    
    // 현재 날짜가 속한 주차 계산
    const weekNumber = getWeekNumberForDate(today);
    
    // 다음 주차 계산
    let nextWeekNumber = weekNumber + 1;
    let nextWeekYear = year;
    
    // 만약 다음 주차가 해당 연도의 주차 수를 초과하면 다음 연도의 1주차로 설정
    if (nextWeekNumber > getWeeksInYear(year)) {
        nextWeekNumber = 1;
        nextWeekYear = year + 1;
    }
    
    // ISO 8601 형식의 주차 문자열 생성 (YYYY-Www)
    const currentWeekString = `${year}-W${String(weekNumber).padStart(2, '0')}`;
    const nextWeekString = `${nextWeekYear}-W${String(nextWeekNumber).padStart(2, '0')}`;
    
    // 입력 필드에 기본값 설정
    startWeekInput.value = currentWeekString;
    endWeekInput.value = nextWeekString;
    
    // 자동으로 달력 생성
    generateCalendars();
}

/**
 * 주어진 날짜의 주차 계산
 * @param {Date} date - 날짜 객체
 * @returns {number} - 해당 날짜의 주차
 */
function getWeekNumberForDate(date) {
    // 해당 연도의 1월 1일
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    
    // 1월 1일의 요일 (0: 일요일, 1: 월요일, ..., 6: 토요일)
    const dayOfWeek = firstDayOfYear.getDay();
    
    // 첫번째 주의 일요일까지의 날짜 차이 계산
    const daysToFirstSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
    
    // 해당 연도의 첫 번째 일요일
    const firstSunday = new Date(firstDayOfYear);
    firstSunday.setDate(firstDayOfYear.getDate() + daysToFirstSunday);
    
    // 주어진 날짜와 첫 번째 일요일 사이의 일수 차이 계산
    const daysDifference = Math.floor((date - firstSunday) / (24 * 60 * 60 * 1000));
    
    // 주차 계산 (첫 번째 일요일이 속한 주를 1주차로 계산)
    const weekNumber = Math.floor(daysDifference / 7) + 1;
    
    // 결과 반환 (첫 번째 일요일 이전의 날짜는 첫 주차로 간주)
    return date < firstSunday ? 1 : weekNumber;
}

/**
 * 시작 주차부터 종료 주차까지의 모든 달력 생성
 */
async function generateCalendars() {
    // 입력값 검증
    if (!startWeekInput.value || !endWeekInput.value) {
        showAlert('입력 오류', '시작 주차와 종료 주차를 모두 선택해주세요.');
        return;
    }
    
    // 시작 주차와 종료 주차 파싱
    const startWeek = parseWeekString(startWeekInput.value);
    const endWeek = parseWeekString(endWeekInput.value);
    
    // 시작 주차가 종료 주차보다 이후인지 검증
    if (startWeek.year > endWeek.year || 
        (startWeek.year === endWeek.year && startWeek.week > endWeek.week)) {
        showAlert('입력 오류', '시작 주차는 종료 주차보다 이전이어야 합니다.');
        return;
    }
    
    // 달력 컨테이너 초기화
    calendarContainer.innerHTML = '';
    
    // 각 주차별로 달력 생성
    let currentYear = startWeek.year;
    let currentWeek = startWeek.week;
    
    while (
        currentYear < endWeek.year || 
        (currentYear === endWeek.year && currentWeek <= endWeek.week)
    ) {
        // 현재 주차의 날짜 범위 계산
        const weekDates = getWeekDates(currentYear, currentWeek);
        
        // 주간 달력 생성
        await createWeeklyCalendar(weekDates, currentYear, currentWeek);
        
        // 다음 주차로 이동
        if (currentWeek === getWeeksInYear(currentYear)) {
            currentYear++;
            currentWeek = 1;
        } else {
            currentWeek++;
        }
    }
}

/**
 * 주간 달력 생성
 * @param {Array} weekDates - 주간 날짜 배열
 * @param {number} year - 연도
 * @param {number} weekNum - 주차
 */
async function createWeeklyCalendar(weekDates, year, weekNum) {
    // 주간 달력 컨테이너 생성
    const weeklyCalendar = document.createElement('div');
    weeklyCalendar.className = 'weekly-calendar';
    
    // 달력 헤더 생성
    const calendarHeader = document.createElement('div');
    calendarHeader.className = 'calendar-header';
    
    // 달력 제목 생성
    const title = document.createElement('h2');
    title.className = 'calendar-title';
    title.textContent = '우리집 주간 활동 일정표';
    
    // 주차 정보 표시
    const weekInfo = document.createElement('span');
    weekInfo.className = 'calendar-week';
    
    // 월 정보 추출 (주간의 시작일과 종료일의 월 표시)
    const startMonth = weekDates[1].getMonth() + 1; // 월요일(인덱스 1)부터 시작
    const endMonth = weekDates[6].getMonth() + 1;   // 토요일(인덱스 6)까지
    
    // 주차 정보 표시 (같은 달이면 한 번만, 다른 달이면 두 달 표시)
    if (startMonth === endMonth) {
        weekInfo.textContent = `${year}년 ${startMonth}월 ${weekNum}주차`;
    } else {
        weekInfo.textContent = `${year}년 ${startMonth}월-${endMonth}월 ${weekNum}주차`;
    }
    
    calendarHeader.appendChild(title);
    calendarHeader.appendChild(weekInfo);
    weeklyCalendar.appendChild(calendarHeader);
    
    // 달력 그리드 생성
    const calendarGrid = document.createElement('div');
    calendarGrid.className = 'calendar-grid';
    
    // 각 요일별 열 생성 (일요일부터 토요일까지)
    for (let i = 0; i < 7; i++) {
        // 일요일은 건너뛰기
        if (i === 0) continue;
        
        const currentDate = weekDates[i];
        const dateNumber = parseInt(
            `${currentDate.getFullYear()}${String(currentDate.getMonth() + 1).padStart(2, '0')}${String(currentDate.getDate()).padStart(2, '0')}`, 
            10
        );
        
        // 해당 날짜의 활동 데이터 가져오기
        const activitiesData = await getPlanData(dateNumber);
        
        // 요일 열 생성
        const dayColumn = document.createElement('div');
        dayColumn.className = 'day-column';
        
        // 요일별 클래스 추가
        const dayClasses = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        dayColumn.classList.add(dayClasses[i]);
        
        // 요일 헤더 생성
        const dayHeader = document.createElement('div');
        dayHeader.className = 'day-header';
        
        // 날짜 생성 (먼저 추가)
        const date = document.createElement('span');
        date.className = 'date';
        date.textContent = `${currentDate.getMonth() + 1}/${currentDate.getDate()}`;
        
        // 요일명 생성 (나중에 추가)
        const weekday = document.createElement('span');
        weekday.className = 'weekday';
        weekday.textContent = weekdays[i];
        
        // 순서 변경: 날짜를 먼저, 요일을 나중에 추가
        dayHeader.appendChild(date);
        dayHeader.appendChild(weekday);
        dayColumn.appendChild(dayHeader);
        
        // 요일 헤더에 더블클릭 이벤트 추가
        addDayHeaderEvents(dayHeader);
        
        // 요일 콘텐츠 컨테이너 생성
        const dayContent = document.createElement('div');
        dayContent.className = 'day-content';
        
        // 활동 데이터 시간대별로 그룹화
        const timeGroups = groupActivitiesByTime(activitiesData);
        
        // 시간대별로 정렬
        const sortedTimeKeys = Object.keys(timeGroups).sort((a, b) => {
            const [startA, endA] = a.split('-');
            const [startB, endB] = b.split('-');
            return convertTimeToMinutes(startA) - convertTimeToMinutes(startB);
        });
        
        // 상위 5개 타임슬롯만 사용 (더 있으면 무시)
        const slotsToShow = Math.min(sortedTimeKeys.length, 5);
        
        // 각 시간대별 슬롯 생성
        for (let slot = 0; slot < 5; slot++) {
            const timeSlot = document.createElement('div');
            timeSlot.className = `time-slot slot-${slot + 1}`;
            
            if (slot < slotsToShow) {
                const timeKey = sortedTimeKeys[slot];
                const activities = timeGroups[timeKey];
                
                // 시간 라벨 표시
                const timeLabel = document.createElement('div');
                timeLabel.className = 'time-label';
                const [startTime, endTime] = timeKey.split('-');
                
                // 차수 계산 (1차, 2차, ...)
                const orderNum = slot + 1;
                
                // 시간 포맷팅 (09:00 - 10:00 형식)
                const formattedStartTime = formatTime(startTime);
                const formattedEndTime = formatTime(endTime);
                
                timeLabel.textContent = `${orderNum}차 ${formattedStartTime} - ${formattedEndTime}`;
                timeSlot.appendChild(timeLabel);
                
                // 각 활동을 개별 활동 태그로 표시
                activities.forEach(activity => {
                    const activityElement = document.createElement('div');
                    activityElement.className = 'activity';
                    activityElement.textContent = activity.활동명;
                    timeSlot.appendChild(activityElement);
                });
            }
            
            dayContent.appendChild(timeSlot);
        }
        
        // 점심 시간 슬롯
        const lunchSlot = document.createElement('div');
        lunchSlot.className = 'time-slot slot-lunch';
        
        // 점심 시간 라벨
        const lunchLabel = document.createElement('div');
        lunchLabel.className = 'time-label';
        lunchLabel.textContent = '점심 시간';
        
        // 점심 시간 입력 필드
        const lunchTimeInput = document.createElement('input');
        lunchTimeInput.className = 'meal-time-input';
        lunchTimeInput.type = 'text';
        lunchTimeInput.value = '12:00 ~ 13:00';
        lunchTimeInput.placeholder = '시간 입력';
        
        lunchSlot.appendChild(lunchLabel);
        lunchSlot.appendChild(lunchTimeInput);
        dayContent.appendChild(lunchSlot);
        
        // 저녁 시간 슬롯
        const dinnerSlot = document.createElement('div');
        dinnerSlot.className = 'time-slot slot-dinner';
        
        // 저녁 시간 라벨
        const dinnerLabel = document.createElement('div');
        dinnerLabel.className = 'time-label';
        dinnerLabel.textContent = '저녁 시간';
        
        // 저녁 시간 입력 필드
        const dinnerTimeInput = document.createElement('input');
        dinnerTimeInput.className = 'meal-time-input';
        dinnerTimeInput.type = 'text';
        dinnerTimeInput.value = '17:00 ~ 18:00';
        dinnerTimeInput.placeholder = '시간 입력';
        
        dinnerSlot.appendChild(dinnerLabel);
        dinnerSlot.appendChild(dinnerTimeInput);
        dayContent.appendChild(dinnerSlot);
        
        dayColumn.appendChild(dayContent);
        calendarGrid.appendChild(dayColumn);
    }
    
    weeklyCalendar.appendChild(calendarGrid);
    calendarContainer.appendChild(weeklyCalendar);
}

/**
 * 시작시간과 종료시간이 동일한 활동들을 그룹화
 * @param {Array} activities - 활동 데이터 배열
 * @returns {Object} - 시간대별로 그룹화된 활동 객체
 */
function groupActivitiesByTime(activities) {
    const groups = {};
    
    activities.forEach(activity => {
        const timeKey = `${activity.시작시간}-${activity.종료시간}`;
        
        if (!groups[timeKey]) {
            groups[timeKey] = [];
        }
        
        groups[timeKey].push(activity);
    });
    
    return groups;
}

/**
 * 달력 인쇄
 */
function printCalendars() {
    // 모든 캘린더가 화면에 보이는지 확인
    const calendars = document.querySelectorAll('.weekly-calendar');
    if (calendars.length === 0) {
        showAlert('인쇄 오류', '인쇄할 캘린더가 없습니다. 먼저 일정표를 생성해주세요.');
        return;
    }
    
    // 인쇄용 클래스 추가
    document.body.classList.add('printing-mode');
    
    // 모든 캘린더를 보이게 설정
    calendars.forEach(calendar => {
        calendar.style.display = 'flex';
    });
    
    // 인쇄 실행
    window.print();
    
    // 인쇄 후 클래스 제거
    document.body.classList.remove('printing-mode');
}

/**
 * 알림 모달 표시
 * @param {string} title - 제목
 * @param {string} message - 메시지
 */
function showAlert(title, message) {
    alertTitle.textContent = title;
    alertMessage.textContent = message;
    alertModal.style.display = 'block';
}

/**
 * 확인 모달 표시
 * @param {string} title - 제목
 * @param {string} message - 메시지
 * @param {Function} onConfirm - 확인 콜백
 */
function showConfirm(title, message, onConfirm) {
    confirmTitle.textContent = title;
    confirmMessage.textContent = message;
    confirmModal.style.display = 'block';
    
    // 확인 버튼 클릭 이벤트 재설정
    confirmOkBtn.onclick = function() {
        confirmModal.style.display = 'none';
        if (typeof onConfirm === 'function') {
            onConfirm();
        }
    };
    
    // 취소 버튼 클릭 이벤트
    confirmCancelBtn.onclick = function() {
        confirmModal.style.display = 'none';
    };
}

/**
 * 주차 문자열 파싱 (YYYY-Www 형식)
 * @param {string} weekString - 주차 문자열
 * @returns {Object} - {year, week} 형식의 객체
 */
function parseWeekString(weekString) {
    const matches = weekString.match(/(\d{4})-W(\d{2})/);
    if (matches) {
        return {
            year: parseInt(matches[1], 10),
            week: parseInt(matches[2], 10)
        };
    }
    return { year: 0, week: 0 };
}

/**
 * 지정된 연도와 주차에 해당하는 날짜 범위 계산
 * @param {number} year - 연도
 * @param {number} week - 주차
 * @returns {Array} - 해당 주간의 날짜 배열 (일~토)
 */
function getWeekDates(year, week) {
    // 1월 1일 시작
    const firstDayOfYear = new Date(year, 0, 1);
    // 첫 번째 주의 첫 번째 일요일 찾기
    const dayOfWeek = firstDayOfYear.getDay(); // 0: 일요일, 1: 월요일, ..., 6: 토요일
    const daysToFirstSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
    
    const firstSunday = new Date(year, 0, 1 + daysToFirstSunday);
    
    // 첫 번째 주가 아닐 경우, 해당 주차의 일요일 계산
    const targetSunday = new Date(firstSunday);
    targetSunday.setDate(firstSunday.getDate() + (week - 1) * 7);
    
    // 해당 주간의 7일 계산
    const weekDates = [];
    for (let i = 0; i < 7; i++) {
        const date = new Date(targetSunday);
        date.setDate(targetSunday.getDate() + i);
        weekDates.push(date);
    }
    
    return weekDates;
}

/**
 * 연도의 총 주차 수 계산
 * @param {number} year - 연도
 * @returns {number} - 해당 연도의 총 주차 수
 */
function getWeeksInYear(year) {
    // 12월 31일이 몇 번째 주에 속하는지 계산
    const dec31 = new Date(year, 11, 31);
    const dayOfWeek = dec31.getDay();
    
    // ISO 8601 기준 (첫 주는 연도의 첫 목요일을 포함하는 주)
    // 마지막 주가 다음 연도에 속할 경우 52주, 그렇지 않으면 53주
    return dayOfWeek < 3 ? 52 : 53;
}

/**
 * 시간 문자열을 분 단위로 변환
 * @param {string} timeStr - 시간 문자열 (예: "09:00")
 * @returns {number} - 분 단위 시간
 */
function convertTimeToMinutes(timeStr) {
    if (!timeStr) return 0;
    
    const [hours, minutes] = timeStr.split(':').map(part => parseInt(part, 10));
    return hours * 60 + (minutes || 0);
}

/**
 * 날짜에 해당하는 계획 데이터 가져오기
 * @param {number} date - 날짜 (yyyymmdd 형식의 숫자)
 * @returns {Promise<Array>} - 계획 데이터 객체 배열
 */
async function getPlanData(date) {
    try {
        // 날짜는 int4 타입이므로 숫자로 변환
        const dateNumber = parseInt(date, 10);
        
        // window.supabase 사용
        if (!window.supabase) {
            console.error('Supabase 클라이언트가 초기화되지 않았습니다.');
            return [];
        }
        
        // Supabase 쿼리 실행
        const { data, error } = await window.supabase
            .from('activities_plan')
            .select('*')
            .eq('날짜', dateNumber)
            .order('시작시간', { ascending: true });
        
        if (error) {
            console.error('계획 데이터 조회 오류:', error);
            return [];
        }
        
        // 객체 형태 그대로 반환
        return data;
    } catch (error) {
        console.error('계획 데이터 처리 중 오류 발생:', error);
        return [];
    }
}

/**
 * 공휴일 입력 모달 생성
 */
function createHolidayModal() {
    // 이미 존재하는 경우 재생성하지 않음
    if (document.getElementById('holidayModal')) return;
    
    // 모달 컨테이너 생성
    holidayModal = document.createElement('div');
    holidayModal.id = 'holidayModal';
    holidayModal.className = 'holiday-modal';
    
    // 모달 내용 생성
    const modalContent = document.createElement('div');
    modalContent.className = 'holiday-modal-content';
    
    // 모달 헤더
    const modalHeader = document.createElement('div');
    modalHeader.className = 'holiday-modal-header';
    
    const modalTitle = document.createElement('h3');
    modalTitle.textContent = '공휴일 설정';
    
    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'close-alert';
    closeBtn.innerHTML = '&times;';
    closeBtn.addEventListener('click', function() {
        holidayModal.style.display = 'none';
    });
    
    modalHeader.appendChild(modalTitle);
    modalHeader.appendChild(closeBtn);
    
    // 모달 본문
    const modalBody = document.createElement('div');
    modalBody.className = 'holiday-modal-body';
    
    const label = document.createElement('label');
    label.htmlFor = 'holidayName';
    label.textContent = '공휴일 이름:';
    
    holidayInput = document.createElement('input');
    holidayInput.type = 'text';
    holidayInput.id = 'holidayName';
    holidayInput.placeholder = '공휴일 이름 입력';
    
    modalBody.appendChild(label);
    modalBody.appendChild(holidayInput);
    
    // 모달 푸터
    const modalFooter = document.createElement('div');
    modalFooter.className = 'holiday-modal-footer';
    
    holidayRemoveBtn = document.createElement('button');
    holidayRemoveBtn.type = 'button';
    holidayRemoveBtn.className = 'holiday-remove-btn';
    holidayRemoveBtn.textContent = '삭제';
    holidayRemoveBtn.addEventListener('click', removeHoliday);
    
    holidaySaveBtn = document.createElement('button');
    holidaySaveBtn.type = 'button';
    holidaySaveBtn.className = 'holiday-save-btn';
    holidaySaveBtn.textContent = '저장';
    holidaySaveBtn.addEventListener('click', saveHoliday);
    
    holidayCancelBtn = document.createElement('button');
    holidayCancelBtn.type = 'button';
    holidayCancelBtn.className = 'holiday-cancel-btn';
    holidayCancelBtn.textContent = '취소';
    holidayCancelBtn.addEventListener('click', function() {
        holidayModal.style.display = 'none';
    });
    
    modalFooter.appendChild(holidayRemoveBtn);
    modalFooter.appendChild(holidaySaveBtn);
    modalFooter.appendChild(holidayCancelBtn);
    
    // 모달 구성
    modalContent.appendChild(modalHeader);
    modalContent.appendChild(modalBody);
    modalContent.appendChild(modalFooter);
    
    holidayModal.appendChild(modalContent);
    
    // body에 모달 추가
    document.body.appendChild(holidayModal);
}

/**
 * 공휴일 저장
 */
function saveHoliday() {
    const holidayName = holidayInput.value.trim();
    
    if (holidayName) {
        // 공휴일 이름 표시
        let holidayNameElement = currentHolidayHeader.querySelector('.holiday-name');
        if (!holidayNameElement) {
            holidayNameElement = document.createElement('span');
            holidayNameElement.className = 'holiday-name';
            currentHolidayHeader.appendChild(holidayNameElement);
        }
        holidayNameElement.textContent = `(${holidayName})`;
        
        // 공휴일 스타일 적용
        currentHolidayHeader.classList.add('holiday');
    } else {
        // 공휴일 이름 없으면 제거
        removeHoliday();
    }
    
    // 모달 닫기
    holidayModal.style.display = 'none';
}

/**
 * 공휴일 삭제
 */
function removeHoliday() {
    // 공휴일 이름 제거
    const holidayNameElement = currentHolidayHeader.querySelector('.holiday-name');
    if (holidayNameElement) {
        holidayNameElement.remove();
    }
    
    // 공휴일 스타일 제거
    currentHolidayHeader.classList.remove('holiday');
    
    // 모달 닫기
    holidayModal.style.display = 'none';
}

/**
 * 공휴일 모달 열기
 * @param {HTMLElement} dayHeader - 요일 헤더 요소
 */
function openHolidayModal(dayHeader) {
    currentHolidayHeader = dayHeader;
    
    // 기존 공휴일 이름 가져오기
    const holidayNameElement = dayHeader.querySelector('.holiday-name');
    if (holidayNameElement) {
        const holidayName = holidayNameElement.textContent.replace(/[()]/g, '');
        holidayInput.value = holidayName;
        holidayRemoveBtn.style.display = 'block';
    } else {
        holidayInput.value = '';
        holidayRemoveBtn.style.display = 'none';
    }
    
    // 모달 표시
    holidayModal.style.display = 'block';
}

/**
 * 요일 헤더에 더블클릭 이벤트 추가
 * @param {HTMLElement} dayHeader - 요일 헤더 요소
 */
function addDayHeaderEvents(dayHeader) {
    dayHeader.style.cursor = 'pointer';
    dayHeader.addEventListener('dblclick', function() {
        openHolidayModal(this);
    });
}

/**
 * 시간 포맷팅 (09:00 - 10:00 형식)
 * @param {string} timeStr - 시간 문자열 (예: "09:00" 또는 "900")
 * @returns {string} - 포맷팅된 시간 문자열
 */
function formatTime(timeStr) {
    if (!timeStr) return '';
    
    // 콜론이 있는지 확인
    if (timeStr.includes(':')) {
        // HH:MM 형식 처리
        const [hours, minutes] = timeStr.split(':').map(part => parseInt(part, 10) || 0);
        const formattedHours = String(hours).padStart(2, '0');
        const formattedMinutes = String(minutes).padStart(2, '0');
        return `${formattedHours}:${formattedMinutes}`;
    } else {
        // 시간만 있는 경우 (예: '900' → '09:00')
        const timeNum = parseInt(timeStr, 10);
        if (isNaN(timeNum)) return timeStr; // 파싱 실패 시 원본 반환
        
        const hours = Math.floor(timeNum / 100);
        const minutes = timeNum % 100;
        
        const formattedHours = String(hours).padStart(2, '0');
        const formattedMinutes = String(minutes).padStart(2, '0');
        return `${formattedHours}:${formattedMinutes}`;
    }
} 