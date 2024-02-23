date1.txt: date2.txt date3.txt
	echo date1.txt is being build

date2.txt: date3.txt
	echo date2.txt is being build

date3.txt: date4.txt
	echo date3.txt is being build
	cp date4.txt date3.txt

