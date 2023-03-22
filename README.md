# Dementia App
## 내손에 치매안심주치의
### Develop
* Node.js version : 18.14.0
* Expo로 개발되어 있음.
    * Expo SDK 48
* 패키지 관리 : yarn
* 패키지 설치 : yarn install
* 실행 : expo start
* React Native version : 0.71.3
* react-native-maps를 사용해 지도를 구현함.
* expo-sqlite를 사용해 병원 관련 어플을 관리함.
    * expo-location을 사용해 현재 위치를 가져옴.
    * 추후 병원 리스트 추가 및 수정 시 assets/csv/hospital_list.csv에 있는 값을 변경하면 됨.
    * csv에 있는 값은 다음과 같음.
        * 병원명, 구역, 전화번호, 주소, 즐겨찾기(기본값 0), 위도, 경도
        