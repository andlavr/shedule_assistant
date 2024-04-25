FROM python:3.11
WORKDIR /usr/src/app

RUN apt-get -y update
RUN apt-get -y upgrade

COPY . .

RUN pip install -r requirements.txt
EXPOSE 25001

CMD ["python3", "./manage.py"]