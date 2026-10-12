#include <iostream>
using namespace std;
int main(){
    int n;cin>>n;
    int number;
    int count=0;
    int sum=0;
    int product=1;
    int largest=0;
    int smallest=9;
    int even=0;
    int odd=0;
    
    int temp = n;
    
    while(temp>0){
        number=temp%10;
        count++;
        temp=temp/10;
        
    } cout<<"number of digits ; "<<count<<endl;
    
    temp=n;
    while(temp>0){
        number=temp%10;
        sum=sum+number;
        temp =temp /10;

    }cout<<"sum of digits ; "<<sum<<endl;
    
    temp=n;
    while(temp>0){
        number=temp %10;
        product=product*number;
        temp =temp /10;

    }cout<<"product of digits ; "<<product<<endl;

    temp = n;

      while (temp > 0) {

    int digit = temp % 10;

    if (digit > largest) {
        largest = digit;
    }

    if (digit < smallest) {
        smallest = digit;
    }

    if (digit % 2 == 0) {
        even++;
    }
    else {
        odd++;
    }

    temp = temp / 10;
}cout << "largest digit ; " << largest << endl;
    cout << "smallest digit ; " << smallest << endl;
    cout << "even digit total ; " << even << endl;
    cout << "odd digit total ; " << odd << endl;
    return 0;
}