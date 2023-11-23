echo "Starting main.sh"

sudo stty 115200 -F /dev/ttyUSB0 raw -echo
# Echo serial port read to console
cat /dev/ttyUSB0 