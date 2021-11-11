# 🔗 체인그램

**업비트, 빗썸, 코인원, 바이낸스**

🔗Blockchain + 💬Telegram = Chaingram

블럭체인 거래소 공지사항을 한 번에 텔레그램 봇으로 받을 수 있습니다.

⚠️ 해당 소프트웨어를 사용함에 따른 책임은 이를 이용하는 **사용자**에게 있음을 알려드립니다.

❌ 이의 제기 및 기타 문의는 **iam@dan.al**으로 문의주세요.

## Installation

### Require Setup

- Install Node.js
- Install Git
- Create Telegram Bot

### Git Clone

```bash
git clone https://github.com/danieluhm2004/chaingram
```

해당 프로젝트를 다운로드 합니다.

### NPM Install

```bash
npm install
```

필요한 라이브러리를 설치합니다.

### TypeScript Build

```bash
npm run build
```

프로젝트를 JS로 빌드합니다.

> ⚠️ 오류가 발생하나요?
>
> ```bash
> npm install -g typescript
> ```
>
> 위 명령어를 사용해보세요.

### Program Setup

```bash
npm run setup
```

기존 공지사항을 다운로드하여 중복 발송을 막습니다.

### Install PM2

**NPM**으로 설치할 경우, if you using **NPM**

```bash
npm install pm2 -g
```

NPM이 없거나 원치 않은 경우, if you not using **NPM**

```bash
wget -qO- https://getpm2.com/install.sh | bash
```

위 두가지 방법 중 하나를 택하여 PM2를 다운로드합니다.

### Setup Config

config.json 파일을 아래와 같이 설정합니다.

```json
{
  "interval": 60,
  "telegram": {
    "token": "< Write Your Telegram Bot Token >",
    "chats": ["< Write Your Chat ID >"]
  },
  "crawler": [
    {
      "name": "업비트",
      "enabled": true,
      "protocol": "upbit",
      "endpoint": "https://api-manager.upbit.com",
      "contents": true,
      "cleanSuffix": true
    },
    {
      "name": "업비트 공시",
      "enabled": true,
      "protocol": "upbit disclosure",
      "endpoint": "https://project-team.upbit.com",
      "contents": false,
      "cleanSuffix": false
    },
    {
      "name": "빗썸",
      "enabled": true,
      "protocol": "bithumb",
      "endpoint": "https://cafe.bithumb.com",
      "contents": true,
      "cleanSuffix": true
    },
    {
      "name": "코인원",
      "enabled": true,
      "protocol": "coinone",
      "endpoint": "https://i1.coinone.co.kr",
      "contents": false,
      "cleanSuffix": false
    },
    {
      "name": "바이낸스",
      "enabled": true,
      "protocol": "binance",
      "endpoint": "https://binance.zendesk.com",
      "contents": false,
      "cleanSuffix": true
    }
  ]
}
```

< > 로 되어 있는 설정값은 반드시 변경해주셔야 합니다. 알림을 원치 않는 거래소가 있다면 `enabled` 를 `false`로 변경하세요.

### Start PM2

```bash
pm2 start ecosystem.config.js
```

아래 명령어를 사용하여 프로그램을 실행하세요.

### Done!

🥳 축하해요. 이제 알림을 받아볼 수 있어요!
