# 🛒 Django Ecommerce — Full Stack

> Plateforme e-commerce complète avec intelligence artificielle intégrée.
> **Backend** : Django REST Framework · **Frontend** : React + TypeScript + Vite

---

## 🏗️ Stack Technique

| Couche | Technologies |
|---|---|
| **Backend** | Python 3.10+, Django 5.2, Django REST Framework, SimpleJWT |
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui |
| **IA** | Google Gemini API |
| **Paiement** | Paystack |
| **Base de données** | MysQL |

---

## 📁 Structure du projet

```
django-ecommerce/         ← Backend Django
react-ecommerce-site/     ← Frontend React
```

---

## ⚙️ Installation

### 🐍 Backend

```bash
cd django-ecommerce
python -m venv venv
venv\Scripts\activate    # Windows : venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env          # puis renseigner les clés API
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

> API disponible sur `http://127.0.0.1:8000`

### ⚛️ Frontend

```bash
cd react-ecommerce-site
npm install
cp .env.example .env
npm run dev
```

> Site disponible sur `http://localhost:5173`

---

## 🔑 Variables d'environnement

**Backend** (`.env`) :
```
GEMINI_API_KEY=...
PAYSTACK_SECRET_KEY=...
```

**Frontend** (`.env`) :
```
VITE_API_URL=http://localhost:8000
```


"# Full-Stack_Django-React" 
