#include <iostream>
using namespace std;
int main(){
    int n;cin>>n;
    n=(n+1)/2;
    //row
    for (int row=1;row<=n;row++){
        //num
        for (int num=1;num<=row;num++){
            cout<<num;
            //space
            for(int space=1;space<=(2*(n-row )-1);space++){
            cout<<" ";
            //number
            int lastRowNum=row;
        }if(row==n) lastRowNum--;
        for(int num2= lastRowNum;num2>=1;num2--) cout<<
        }cout<< endl;
    }
    return 0;
}