#include <iostream>
using namespace std;

int f(int n,int &pow){
    //base
    if(n<10){pow++;return n;}
    //rec case
    int rdr = f(n/10,pow);
    const int powr=pow++;
    int temp=1;
    //seperate calculation for 10^powr
    for (int i=1;i<=powr;i++) temp*=10;
    return (n%10)*(temp)+rdr;
}

int main(){
    int n;cin>>n;
    int pow=0;
    cout<<f(n,pow)<<endl;
    
    return 0;
} 