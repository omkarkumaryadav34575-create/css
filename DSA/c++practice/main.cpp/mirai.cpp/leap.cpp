#include <iostream>
using namespace std;
int main(){
    int year;
    cout<<"enter year"<<endl;
    cin>>year;
    if (year%4==0){
        cout<<"it is a leap year"<<endl;
    } else if (year%100==0){
        cout<<"not a leap year"<<endl
    }
    }
    return 0;
}