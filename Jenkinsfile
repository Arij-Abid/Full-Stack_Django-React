pipeline {
agent any
    
environment {
    DOCKERHUB_CREDENTIALS = credentials('dockerhub_id')
    SECRET_KEY = credentials('secret-key-id')
    GOOGLE_API_KEY = credentials('google-api-key')
    DB_PASSWORD = credentials('mysql-password')
    SONAR_TOKEN = credentials('sonar-token')
}

stages {

    stage('Checkout') {
        steps {
            deleteDir()

            git(
                branch: 'main',
                url: 'https://github.com/Arij-Abid/Full-Stack_Django-React.git'
            )

            sh 'ls -la'
        }
    }

    stage('Backend Tests') {
        agent {
            docker {
                image 'python:3.11'
                args '-u root'
            }
        }

        steps {
            dir('django-ecommerce') {

                sh '''
                    python -m venv venv
                    . venv/bin/activate

                    python -m pip install --upgrade pip
                    pip install -r requirements.txt

                    export SECRET_KEY=test_secret_key
                    export GOOGLE_API_KEY=test_api_key
                    export DB_PASSWORD=test_password
                    export DB_HOST=localhost
                    export DB_PORT=3306

                    python manage.py test
                '''
            }
        }
    }

    stage('Frontend Build') {
        agent {
            docker {
                image 'node:20'
                args '-u root'
            }
        }

        steps {
            dir('react-ecommerce-site') {

                sh '''
                    export npm_config_cache=/tmp/.npm

                    rm -rf node_modules package-lock.json

                    npm install
                    npm run build
                '''
            }
        }
    }

    stage('Create .env') {
        steps {

            sh """


cat > django-ecommerce/.env << EOF
SECRET_KEY=${SECRET_KEY}
GOOGLE_API_KEY=${GOOGLE_API_KEY}

DB_PASSWORD=${DB_PASSWORD}
DB_HOST=mysql_db
DB_PORT=3306
EOF
"""


            sh 'cat django-ecommerce/.env'
        }
    }

    stage('SonarQube Analysis') {
        steps {

            sh '''
            docker run --rm \
              -v "$PWD:/usr/src" \
              sonarsource/sonar-scanner-cli \
              -Dsonar.projectKey=fullstack-django-react \
              -Dsonar.sources=/usr/src \
              -Dsonar.host.url=http://172.17.0.1:9000 \
              -Dsonar.token=$SONAR_TOKEN \
              -Dsonar.python.version=3.11
            '''
        }
    }

    stage('Build Docker Images') {
        steps {

            sh """
                docker build \
                -t arijabid/django-ecommerce:${BUILD_ID} \
                ./django-ecommerce

                docker build \
                -t arijabid/react-ecommerce-site:${BUILD_ID} \
                ./react-ecommerce-site
            """
        }
    }

    stage('Push Docker Hub') {
        steps {

            sh '''
            echo "$DOCKERHUB_CREDENTIALS_PSW" | docker login \
            -u "$DOCKERHUB_CREDENTIALS_USR" \
            --password-stdin

            docker push arijabid/django-ecommerce:${BUILD_ID}
            docker push arijabid/react-ecommerce-site:${BUILD_ID}
            '''
        }
    }

    stage('Deploy') {
        steps {

            dir('django-ecommerce') {

                sh '''
                docker compose down || true

                docker compose up -d --build

                echo "Waiting containers to start..."
                sleep 30

                echo "=== Containers Status ==="
                docker ps -a

                echo "=== Django Logs ==="
                docker logs django_backend || true

                echo "=== MySQL Logs ==="
                docker logs mysql_db || true
                '''
            }
        }
    }

    stage('Monitoring') {
        steps {

            sh '''
            docker start prometheus || true
            docker start grafana || true
            '''
        }
    }
}

post {

    always {
        sh 'docker logout || true'
        echo 'Pipeline terminé'
    }

    success {
        script {

            echo 'Sending SUCCESS email...'

            emailext(
                subject: "✅ Build Success: ${JOB_NAME} #${BUILD_NUMBER}",

                body: """
                <h2 style="color:green;">
                    Build Successful 🎉
                </h2>

                <p><b>Job Name:</b> ${JOB_NAME}</p>
                <p><b>Build Number:</b> ${BUILD_NUMBER}</p>
                <p><b>Status:</b> SUCCESS</p>

                <p>
                    <a href="${BUILD_URL}">
                        Voir le Build Jenkins
                    </a>
                </p>
                """,

                mimeType: 'text/html',
                to: 'abidarij1@gmail.com'
            )
        }
    }

    failure {
        script {

            echo 'Sending FAILURE email...'

            emailext(
                subject: "❌ Build Failed: ${JOB_NAME} #${BUILD_NUMBER}",

                body: """
                <h2 style="color:red;">
                    Build Failed ❌
                </h2>

                <p><b>Job Name:</b> ${JOB_NAME}</p>
                <p><b>Build Number:</b> ${BUILD_NUMBER}</p>
                <p><b>Status:</b> FAILED</p>

                <p>
                    <a href="${BUILD_URL}">
                        Voir le Build Jenkins
                    </a>
                </p>
                """,

                mimeType: 'text/html',
                to: 'abidarij1@gmail.com'
            )
        }
    }
}

}
