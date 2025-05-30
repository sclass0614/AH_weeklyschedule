# 우리집 주간 활동 일정표

이 웹 애플리케이션은 주간 단위의 활동 일정표를 생성하고 인쇄할 수 있는 도구입니다. A4 용지(가로 방향)에 최적화되어 있으며, 주간 활동을 시간대별로 관리하고 출력할 수 있습니다.

## 주요 기능

- 선택한 주차 기간의 주간 일정표 생성
- 월요일부터 토요일까지 6일간의 일정 표시
- 시간대별 활동 구성 (각 날짜별 최대 5개의 주요 활동 시간대)
- 점심 및 저녁 시간 설정 기능
- 공휴일 설정 기능
- A4 용지(가로 방향) 최적화 인쇄 기능
- 여러 주차를 한 번에 생성하고 인쇄 가능

## 데이터 구조

이 애플리케이션은 Supabase 데이터베이스를 사용하여 활동 데이터를 관리합니다.

### 테이블 구조

**activities_plan 테이블**

- `날짜`: int4 (YYYYMMDD 형식, 예: 20240301)
- `시작시간`: text (HH:MM 형식, 예: "09:00")
- `종료시간`: text (HH:MM 형식, 예: "10:00")
- `활동명`: text (예: "독서 시간")

## 설치 및 설정

1. 프로젝트 파일을 웹 서버에 업로드하거나 로컬 환경에서 실행합니다.

2. Supabase 계정이 필요합니다:

   - Supabase 프로젝트를 생성합니다.
   - `activities_plan` 테이블을 위에 설명된 구조로 생성합니다.
   - URL과 API 키를 `supabase.js` 파일에 설정합니다.

3. 필요한 파일:
   - `calendar.html`: 메인 HTML 파일
   - `calendar.css`: 스타일시트
   - `calendar.js`: 메인 JavaScript 기능
   - `supabase.js`: Supabase 연결 및 초기화

## 사용 방법

1. 브라우저에서 `calendar.html` 파일을 엽니다.

2. "시작 주차"와 "종료 주차"를 선택합니다. 기본적으로 현재 주와 다음 주가 자동 선택됩니다.

3. "일정표 생성" 버튼을 클릭하여 선택한 기간의 주간 일정표를 생성합니다.

4. 각 요일 헤더를 더블클릭하여 공휴일 정보를 추가할 수 있습니다.

5. 점심 및 저녁 시간을 조정할 수 있습니다.

6. "인쇄하기" 버튼을 클릭하여 생성된 일정표를 인쇄합니다. 모든 일정표는 A4 용지(가로 방향)에 맞게 최적화되어 인쇄됩니다.

## 커스터마이징

- `calendar.css` 파일을 수정하여 디자인을 변경할 수 있습니다.
- 시간대 수와 구성은 `calendar.js` 파일의 `createWeeklyCalendar` 함수에서 조정할 수 있습니다.
- 인쇄 설정은 `calendar.css` 파일의 `@media print` 섹션과 `printing-mode` 클래스에서 조정할 수 있습니다.

## 기술 스택

- HTML5
- CSS3
- JavaScript (ES6+)
- [Supabase](https://supabase.io/)

## 문제 해결

- 인쇄 시 레이아웃 문제가 발생하는 경우, 브라우저의 인쇄 설정에서 "배경 그래픽" 옵션을 활성화했는지 확인하세요.
- 데이터가 표시되지 않는 경우, Supabase 연결 설정을 확인하고 콘솔에 오류 메시지가 있는지 확인하세요.

## 크레딧

이 프로젝트는 가정용 주간 일정 관리를 위해 개발되었습니다.
