# ABCity — игры курса чтения

ABCity объединяет три самостоятельные браузерные игры в одно городское приключение. Интерфейс игр — на русском языке, а утверждённый учебный материал (английские буквы, слова и предложения) сохраняется на английском без изменений.

## Запуск

Из корня репозитория запустите статический сервер:

```powershell
python -m http.server 8000
```

Откройте общую карту: `http://localhost:8000/`.

Игры доступны и напрямую:

- `http://localhost:8000/games/night-rescue/` — «Ночная миссия»;
- `http://localhost:8000/games/mystery-egg/` — «Таинственное яйцо»;
- `http://localhost:8000/games/secret-vault/` — «Секретное хранилище».

Сборка, backend и внешние runtime-зависимости не нужны. Для загрузки утверждённых JSON-файлов страницу следует открывать через HTTP, а не через `file://`.

## Сохранение прогресса

Прогресс хранится локально в браузере в существующих ключах:

- `abcity.nightRescue.v1`;
- `abcity.mysteryEgg.v1`;
- `abcity.secretVault.v1`.

Главная страница читает эти записи защитно и показывает состояния «Не начато», «В процессе» и «Выполнено». Повреждённая или отсутствующая запись считается неначатой игрой.

## Проверка

Из корня репозитория:

```powershell
node tests/home-progress.test.mjs
node games/mystery-egg/test.mjs
node games/secret-vault/test.mjs
python docs/content/validate_content.py
git diff --check
```

Проверка доступности страниц после запуска сервера:

```powershell
Invoke-WebRequest http://localhost:8000/ -UseBasicParsing
Invoke-WebRequest http://localhost:8000/games/night-rescue/ -UseBasicParsing
Invoke-WebRequest http://localhost:8000/games/mystery-egg/ -UseBasicParsing
Invoke-WebRequest http://localhost:8000/games/secret-vault/ -UseBasicParsing
```

Правила и источник утверждённого учебного материала находятся в `docs/content/`.
