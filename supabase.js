// Supabase 연결 정보
const SUPABASE_URL = 'https://dfomeijvzayyszisqflo.supabase.co';
const SUPABASE_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRmb21laWp2emF5eXN6aXNxZmxvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ4NjYwNDIsImV4cCI6MjA2MDQ0MjA0Mn0.-r1iL04wvPNdBeIvgxqXLF2rWqIUX5Ot-qGQRdYo_qk';

// Supabase 클라이언트 초기화
let supabaseClient;

// Supabase 클라이언트 초기화 함수
function initSupabase() {
    if (!supabaseClient) {
        supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_API_KEY);
    }
    return supabaseClient;
}

// ✅ 전역으로 등록 (초기화 함수의 결과물을 window.supabase에 저장)
window.supabase = initSupabase();

// 페이지 로드 시 콘솔에 초기화 정보 출력
document.addEventListener('DOMContentLoaded', function() {
    try {
        console.log('Supabase 클라이언트 초기화 완료');
        // supabase가 이미 window 객체에 추가되었으므로 추가 초기화 작업은 제거
    } catch (error) {
        console.error('Supabase 클라이언트 초기화 오류:', error);
    }
});

/**
 * 날짜에 해당하는 계획 데이터 가져오기
 * @param {number} date - 날짜 (yyyymmdd 형식의 숫자)
 * @returns {Promise<Array>} - 계획 데이터 객체 배열
 */
async function getPlanData(date) {
    try {
        // 클라이언트 확인
        if (!window.supabaseClient) {
            console.error('Supabase 클라이언트가 초기화되지 않았습니다.');
            return [];
        }
        
        // 날짜는 int4 타입이므로 숫자로 변환
        const dateNumber = parseInt(date, 10);
        
        // Supabase 쿼리 실행
        const { data, error } = await window.supabaseClient
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

// 함수를 전역 객체에 할당하여 export (window에 속성으로 노출)
window.getPlanData = getPlanData;

