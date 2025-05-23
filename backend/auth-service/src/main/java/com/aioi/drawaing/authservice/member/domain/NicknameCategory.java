package com.aioi.drawaing.authservice.member.domain;

import java.util.Arrays;
import java.util.List;

public enum NicknameCategory {
    ADJECTIVE(Arrays.asList(
            "행복한", "즐거운", "신나는", "멋진", "용감한", "똑똑한", "귀여운", "활발한", "친절한",
            "열정적인", "정직한", "성실한", "유머러스한", "낙천적인", "우아한", "섬세한", "강인한", "온화한", "겸손한",
            "대담한", "영리한", "재치있는", "상냥한", "진실한", "충실한", "신중한", "관대한", "예의바른", "깔끔한",
            "꼼꼼한", "부지런한", "끈기있는", "유연한", "민첩한", "침착한", "세련된", "고상한", "품위있는", "당당한",
            "자신감있는", "매력적인", "카리스마있는", "유능한", "박학다식한", "재능있는", "근면한", "정의로운", "순수한",
            "따뜻한", "사려깊은", "배려심있는", "존경받는", "존경스러운", "믿음직한", "신뢰하는", "책임감있는", "성숙한",
            "지혜로운", "현명한", "총명한", "영특한", "명석한", "재주많은", "능숙한", "숙련된", "전문적인", "경험많은",
            "노련한", "통찰력있는", "선견지명있는", "선구자적인", "혁신적인", "독창적인", "획기적인", "선도적인", "선진적인", "미래지향적인",
            "개방적인", "포용력있는", "관용적인", "너그러운", "대범한", "여유로운", "느긋한", "평화로운", "조화로운",
            "균형잡힌", "안정된", "차분한", "고요한", "평온한", "담대한", "용기있는", "결단력있는", "의지력강한", "불굴의",
            "다양한", "화려한", "귀족적인", "대담무쌍한", "소박한", "강렬한", "눈부신", "매혹적인", "불가사의한", "풍부한", "무한한", "창의적인", "흔치않은",
            "호화로운", "영속적인", "복잡한", "경이로운", "신비로운", "은은한", "지속적인", "도전적인", "화사한", "자비로운", "천진난만한", "호쾌한", "다정한", "사려깊은",
            "매력있는", "온순한", "열린마음의", "후한", "찬란한", "심오한", "유쾌한", "감동적인", "매끄러운", "빛나는", "단아한", "화기애애한",
            "활기찬", "중요한", "다정다감한", "재미있는", "가벼운", "배려있는", "이상적인", "창조적인", "웅장한", "기발한", "쾌활한", "탁월한",
            "사랑스러운", "소심한", "자유로운", "깊이있는", "다재다능한", "친밀한", "흥미로운", "자기긍정적인", "능력있는", "전환가능한",
            "끈질긴", "해결사적인", "의식이높은", "집중력이뛰어난", "적극적인", "영양가득한", "균형있는", "불굴의의지를가진", "개방적인",
            "접근이쉬운", "세심한", "운명적인", "환상적인", "동화같은", "명료한", "확신에찬", "자기주장이강한",
            "영감을주는", "감성적인", "편안한", "선명한", "낭만적인", "실질적인", "조용한"
    )),
    NOUN(Arrays.asList(
            "호랑이", "독수리", "사자", "펭귄", "코끼리", "병아리", "족제비", "고양이", "강아지", "토끼",
            "다람쥐", "기린", "원숭이", "판다", "코알라", "캥거루", "고릴라", "치타", "표범", "재규어",
            "늑대", "여우", "곰", "하마", "악어", "거북이", "뱀", "이구아나", "카멜레온", "프레리독",
            "비버", "수달", "해달", "물개", "바다사자", "돌고래", "고래", "상어", "문어", "오징어",
            "랍스터", "게", "새우", "불가사리", "해파리", "말미잘", "산호", "해마", "가오리", "물소",
            "참치", "연어", "금붕어", "잉어", "메기", "피라냐", "전기뱀장어", "가재", "두더지", "고슴도치",
            "스컹크", "미어캣", "라마", "알파카", "낙타", "타조", "펠리컨", "플라밍고", "앵무새", "까마귀",
            "까치", "참새", "제비", "올빼미", "부엉이", "공작", "백조", "황새", "두루미", "닭",
            "키위", "에뮤", "카수아리", "알바트로스", "갈매기", "슬로스", "아르마딜로", "타투", "캐피바라",
            "주머니쥐", "코요테", "퓨마", "스라소니", "순록", "엘크", "영양", "가젤", "얼룩말",
            "고래상어", "만타가오리", "카카포", "웜뱃", "멜론헤드돌고래", "회색늑대", "불곰", "도롱뇽", "딱따구리", "흑돼지", "누", "스펙클드문어", "대왕개미핥기", "피닉스",
            "낭타", "모래뱀", "삵", "비단뱀", "울타리비둘기", "삼엽충", "배스킹상어", "황제펭귄", "줄무늬하이에나", "금강앵무", "딱정벌레", "뿔도마뱀",
            "비단원숭이", "개미핥기", "큰부리새", "독일셰퍼드", "스네프스", "제비갈매기", "그리즐리곰", "아프리카코끼리", "잔나비거미", "블루마카우", "투캔",
            "털토끼", "핑크돌고래", "대왕오징어", "스펙클드물개", "붉은여우", "푸들", "불독", "세인트버나드", "스프링어스패니얼", "박쥐", "아이슬랜드말", "금화조", "서열몽키",
            "피그미하마", "그레이트피레니즈", "푸른발부비새", "황금개구리", "일본다람쥐", "영국흑새", "왕도마뱀", "리트리버", "홀스슈크랩", "호랑메기", "스팅레리",
            "개복치", "마젤란펭귄", "피라미", "알락꼬리원숭이", "범무늬고양이", "그레이소요새", "설표", "알래스카말라뮤트", "화난개", "코뿔새", "오셀롯", "빅혼양", "람프로우치",
            "투쿠투쿠", "팔메토버그", "송골매", "미니어쳐핀셔", "스코티시폴드", "블랙펜서", "히말라얀고양이", "울프독", "지니고양이", "빨강개미", "푸른독수리", "황금늑대",
            "회색여우"
    ));

    private final List<String> words;

    NicknameCategory(List<String> words) {
        this.words = words;
    }

    public String getWord(long index) {
        return words.get((int) ((index & Long.MAX_VALUE) % words.size()));
    }

    public int size() {
        return words.size();
    }
}
